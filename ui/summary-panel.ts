/**
 * Summary Panel - Displays all analysis issues in an organized panel
 * 
 * Features:
 * - Issue list grouped by file
 * - Severity indicators
 * - Filtering by severity and category
 * - Click to scroll to line
 * - Export as markdown
 */

import type { FileAnalysisResults, AnalysisResult } from '../types.js';
import { inlineAnnotator } from './inline-annotator.js';

/**
 * Summary Panel class
 */
export class SummaryPanel {
  private element: HTMLElement | null = null;
  private isVisible = false;
  private results: FileAnalysisResults[] = [];
  private filterSeverity = 'all';
  private filterCategory = 'all';
  private onIssueClick?: (result: AnalysisResult) => void;

  constructor(results: FileAnalysisResults[] = []) {
    this.results = results;
  }

  /**
   * Create panel HTML structure
   */
  create(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cra-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'cra-panel__header';
    header.innerHTML = `
      <div class="cra-panel__title">📋 Code Review Assistant</div>
    `;

    // Stats
    const stats = this.renderStats();
    header.appendChild(stats);

    // Filters
    const filters = this.renderFilters();

    // List container
    const listContainer = document.createElement('div');
    listContainer.className = 'cra-panel__list';
    this.renderIssuesList(listContainer);

    // Footer with buttons
    const footer = document.createElement('div');
    footer.className = 'cra-panel__footer';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'cra-panel__export-btn';
    exportBtn.textContent = '📋 Export as Markdown';
    exportBtn.onclick = () => this.exportMarkdown();

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cra-panel__close-btn';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close panel';
    closeBtn.onclick = () => this.hide();

    footer.appendChild(exportBtn);
    footer.appendChild(closeBtn);

    // Assemble panel
    container.appendChild(header);
    container.appendChild(filters);
    container.appendChild(listContainer);
    container.appendChild(footer);

    // Store reference to list for updates
    (container as any)._listContainer = listContainer;

    this.element = container;
    return container;
  }

  /**
   * Render statistics header
   */
  private renderStats(): HTMLElement {
    const stats = document.createElement('div');
    stats.className = 'cra-panel__stats';

    // Count total issues
    let critical = 0;
    let warning = 0;
    let info = 0;

    for (const fileResult of this.results) {
      for (const result of fileResult.results) {
        if (result.severity === 'critical') critical++;
        else if (result.severity === 'warning') warning++;
        else info++;
      }
    }

    const total = critical + warning + info;

    stats.innerHTML = `
      <div>
        <strong>Found ${total} issues in ${this.results.length} files</strong>
      </div>
      <div class="cra-panel__stat">
        <span>🔴 Critical: ${critical}</span>
      </div>
      <div class="cra-panel__stat">
        <span>⚠️ Warning: ${warning}</span>
      </div>
      <div class="cra-panel__stat">
        <span>ℹ️ Info: ${info}</span>
      </div>
    `;

    return stats;
  }

  /**
   * Render filter controls
   */
  private renderFilters(): HTMLElement {
    const filters = document.createElement('div');
    filters.className = 'cra-panel__filters';

    // Severity filter
    const severityGroup = document.createElement('div');
    severityGroup.className = 'cra-panel__filter-group';

    const severitySelect = document.createElement('select');
    severitySelect.className = 'cra-panel__filter-select';
    severitySelect.innerHTML = `
      <option value="all">All Severities</option>
      <option value="critical">Critical Only</option>
      <option value="warning">Warning+</option>
      <option value="info">All Issues</option>
    `;
    severitySelect.onchange = (e) => {
      this.filterSeverity = (e.target as HTMLSelectElement).value;
      this.updateList();
    };

    // Category filter
    const categorySelect = document.createElement('select');
    categorySelect.className = 'cra-panel__filter-select';
    categorySelect.innerHTML = `
      <option value="all">All Categories</option>
      <option value="security">Security</option>
      <option value="debug">Debug</option>
    `;
    categorySelect.onchange = (e) => {
      this.filterCategory = (e.target as HTMLSelectElement).value;
      this.updateList();
    };

    severityGroup.appendChild(severitySelect);
    severityGroup.appendChild(categorySelect);
    filters.appendChild(severityGroup);

    return filters;
  }

  /**
   * Render issues list grouped by file
   */
  private renderIssuesList(container: HTMLElement): void {
    container.innerHTML = '';

    // Group results by file
    const fileGroups = new Map<string, AnalysisResult[]>();

    for (const fileResult of this.results) {
      const filtered = fileResult.results.filter(result => {
        // Apply severity filter
        if (this.filterSeverity !== 'all') {
          if (this.filterSeverity === 'critical' && result.severity !== 'critical') return false;
          if (this.filterSeverity === 'warning' && !['critical', 'warning'].includes(result.severity)) return false;
        }

        // Apply category filter
        if (this.filterCategory !== 'all' && result.category !== this.filterCategory) return false;

        return true;
      });

      if (filtered.length > 0) {
        fileGroups.set(fileResult.filePath, filtered);
      }
    }

    // Render each file group
    if (fileGroups.size === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '16px';
      empty.style.textAlign = 'center';
      empty.style.color = '#6C757D';
      empty.textContent = 'No issues found with current filters';
      container.appendChild(empty);
      return;
    }

    for (const [filePath, issues] of fileGroups) {
      // File header
      const fileHeader = document.createElement('div');
      fileHeader.className = 'cra-panel__file-name';
      fileHeader.textContent = `📁 ${filePath}`;
      container.appendChild(fileHeader);

      // Issues for this file
      const fileContainer = document.createElement('div');
      fileContainer.className = 'cra-panel__file';

      for (const issue of issues) {
        const issueItem = this.renderIssueItem(issue);
        fileContainer.appendChild(issueItem);
      }

      container.appendChild(fileContainer);
    }
  }

  /**
   * Render a single issue item
   */
  private renderIssueItem(result: AnalysisResult): HTMLElement {
    const item = document.createElement('div');
    item.className = `cra-panel__issue cra-panel__issue--${result.severity}`;

    const icons: Record<string, string> = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️',
    };

    item.innerHTML = `
      <div class="cra-panel__issue-line">
        ${icons[result.severity]} Line ${result.lineNumber}: ${result.ruleName}
      </div>
      <div class="cra-panel__issue-rule">
        ${result.ruleId} - ${result.message}
      </div>
    `;

    item.onclick = () => {
      // Highlight line in diff
      inlineAnnotator.highlightLine(result.lineNumber);

      // Call callback if provided
      if (this.onIssueClick) {
        this.onIssueClick(result);
      }
    };

    return item;
  }

  /**
   * Update the issues list (for filtering)
   */
  private updateList(): void {
    if (!this.element) return;
    const listContainer = (this.element as any)._listContainer;
    if (listContainer) {
      this.renderIssuesList(listContainer);
    }
  }

  /**
   * Show panel
   */
  show(): void {
    if (!this.element) {
      this.create();
    }

    if (!this.element) return;

    // Add to DOM if not already there
    if (!this.element.parentElement) {
      document.body.appendChild(this.element);
    }

    this.element.classList.add('cra-panel--visible');
    this.isVisible = true;
  }

  /**
   * Hide panel
   */
  hide(): void {
    if (!this.element) return;

    this.element.classList.remove('cra-panel--visible');
    this.isVisible = false;
  }

  /**
   * Toggle panel visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update results and refresh panel
   */
  setResults(results: FileAnalysisResults[]): void {
    this.results = results;
    if (this.element) {
      // Refresh stats
      const header = this.element.querySelector('.cra-panel__header') as HTMLElement;
      const oldStats = header.querySelector('.cra-panel__stats');
      if (oldStats) {
        oldStats.replaceWith(this.renderStats());
      }

      // Refresh list
      this.updateList();
    }
  }

  /**
   * Export findings as markdown
   */
  exportMarkdown(): void {
    const markdown = this.getMarkdownExport();

    // Copy to clipboard
    navigator.clipboard.writeText(markdown).then(() => {
      // Show confirmation
      alert('Analysis exported to clipboard as markdown!');
    }).catch(() => {
      // Fallback: show in alert
      alert('Markdown export:\n\n' + markdown);
    });
  }

  /**
   * Get markdown representation of findings
   */
  getMarkdownExport(): string {
    const lines: string[] = [];
    lines.push('## Code Review Assistant Findings\n');

    // Summary
    let critical = 0;
    let warning = 0;
    let info = 0;

    for (const fileResult of this.results) {
      for (const result of fileResult.results) {
        if (result.severity === 'critical') critical++;
        else if (result.severity === 'warning') warning++;
        else info++;
      }
    }

    const total = critical + warning + info;
    lines.push(`**Total Issues:** ${total} (${critical} critical, ${warning} warnings, ${info} info)\n`);
    lines.push(`**Analyzed:** ${new Date().toLocaleString()}\n`);

    // Group by severity
    const bySeverity: Record<string, AnalysisResult[]> = {};

    for (const fileResult of this.results) {
      for (const result of fileResult.results) {
        if (!bySeverity[result.severity]) {
          bySeverity[result.severity] = [];
        }
        bySeverity[result.severity].push(result);
      }
    }

    // Critical issues
    if (bySeverity.critical && bySeverity.critical.length > 0) {
      lines.push('### 🔴 Critical Issues\n');
      for (const result of bySeverity.critical) {
        lines.push(this.formatIssueMarkdown(result));
      }
    }

    // Warnings
    if (bySeverity.warning && bySeverity.warning.length > 0) {
      lines.push('### ⚠️ Warnings\n');
      for (const result of bySeverity.warning) {
        lines.push(this.formatIssueMarkdown(result));
      }
    }

    // Info
    if (bySeverity.info && bySeverity.info.length > 0) {
      lines.push('### ℹ️ Info\n');
      for (const result of bySeverity.info) {
        lines.push(this.formatIssueMarkdown(result));
      }
    }

    lines.push('\n---');
    lines.push('*Generated by GitHub Code Review Assistant*');

    return lines.join('\n');
  }

  /**
   * Format a single issue as markdown
   */
  private formatIssueMarkdown(result: AnalysisResult): string {
    const lines: string[] = [];
    lines.push(`**Line ${result.lineNumber}** - ${result.ruleName} (\`${result.ruleId}\`)`);
    lines.push(`- ${result.message}`);
    lines.push(`- Code: \`${result.code}\``);
    if (result.remediation) {
      lines.push(`- Fix: ${result.remediation}`);
    }
    lines.push('');
    return lines.join('\n');
  }

  /**
   * Set callback for issue click
   */
  onIssueSelected(callback: (result: AnalysisResult) => void): void {
    this.onIssueClick = callback;
  }

  /**
   * Check if panel is visible
   */
  isShown(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy panel
   */
  destroy(): void {
    this.hide();
    if (this.element?.parentElement) {
      this.element.remove();
    }
    this.element = null;
  }
}

// Export singleton instance
export const summaryPanel = new SummaryPanel();
