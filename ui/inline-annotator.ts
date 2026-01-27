/**
 * Inline Annotator - Displays severity badges next to flagged lines
 * 
 * Responsible for:
 * - Creating badge elements
 * - Injecting badges into diff lines
 * - Managing badge styling
 * - Handling click/hover events
 */

import type { AnalysisResult, FileAnalysisResults } from '../types';

/**
 * Badge element data structure
 */
interface Badge {
  element: HTMLElement;
  result: AnalysisResult;
  line: HTMLTableRowElement;
}

/**
 * Inline Annotator class
 */
export class InlineAnnotator {
  private badges: Map<string, Badge> = new Map();
  private highlightedLine: HTMLTableRowElement | null = null;

  /**
   * Create a severity badge element
   */
  createBadge(result: AnalysisResult): HTMLElement {
    const badge = document.createElement('span');
    badge.className = `cra-badge cra-badge--${result.severity}`;
    badge.setAttribute('data-rule-id', result.ruleId);
    badge.setAttribute('title', `${result.ruleName} (${result.ruleId})`);

    // Icon mapping by severity
    const icons: Record<string, string> = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const icon = icons[result.severity] || '◆';
    badge.textContent = `${icon} ${result.ruleId}`;

    return badge;
  }

  /**
   * Find the diff table row for a given line number
   */
  findLineInDiff(lineNumber: number): HTMLTableRowElement | null {
    // Try unified diff format first (common)
    const rows = document.querySelectorAll('table.diff-table tr');

    for (const row of rows) {
      // Look for the line number in left or right column
      const lineCell = row.querySelector('td[data-line-number]');
      if (lineCell) {
        const cellLineNum = parseInt(lineCell.getAttribute('data-line-number') || '0', 10);
        if (cellLineNum === lineNumber) {
          return row as HTMLTableRowElement;
        }
      }

      // Fallback: search for line number in text content
      const cells = row.querySelectorAll('td');
      for (const cell of cells) {
        if (cell.textContent?.trim() === lineNumber.toString()) {
          // Found the line cell, return the row
          return row as HTMLTableRowElement;
        }
      }
    }

    return null;
  }

  /**
   * Inject badge into a diff line
   */
  injectBadge(badge: HTMLElement, lineNumber: number, result: AnalysisResult): boolean {
    const line = this.findLineInDiff(lineNumber);
    if (!line) {
      console.warn(`Could not find line ${lineNumber} in diff`);
      return false;
    }

    // Find the code cell in the row
    const codeCell = line.querySelector('td.blob-code, td[data-line-content]');
    if (!codeCell) {
      console.warn(`Could not find code cell for line ${lineNumber}`);
      return false;
    }

    // Create a wrapper for the badge
    const wrapper = document.createElement('span');
    wrapper.className = 'cra-badge-wrapper';
    wrapper.appendChild(badge);

    // Append to code cell
    codeCell.appendChild(wrapper);

    // Store reference
    const badgeKey = `${lineNumber}:${result.ruleId}`;
    this.badges.set(badgeKey, {
      element: badge,
      result,
      line,
    });

    return true;
  }

  /**
   * Render all badges for analysis results
   */
  renderBadges(fileResults: FileAnalysisResults[]): void {
    for (const fileResult of fileResults) {
      for (const result of fileResult.results) {
        const badge = this.createBadge(result);
        this.injectBadge(badge, result.lineNumber, result);
      }
    }
  }

  /**
   * Highlight a specific line
   */
  highlightLine(lineNumber: number): void {
    // Remove previous highlight
    if (this.highlightedLine) {
      this.highlightedLine.classList.remove('cra-line-highlighted');
    }

    // Find and highlight new line
    const line = this.findLineInDiff(lineNumber);
    if (line) {
      line.classList.add('cra-line-highlighted');
      this.highlightedLine = line;

      // Scroll into view
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Clear highlight
   */
  clearHighlight(): void {
    if (this.highlightedLine) {
      this.highlightedLine.classList.remove('cra-line-highlighted');
      this.highlightedLine = null;
    }
  }

  /**
   * Remove all badges
   */
  clear(): void {
    for (const badge of this.badges.values()) {
      badge.element.parentElement?.remove();
    }
    this.badges.clear();
    this.clearHighlight();
  }

  /**
   * Get badge for a specific result
   */
  getBadge(lineNumber: number, ruleId: string): Badge | undefined {
    return this.badges.get(`${lineNumber}:${ruleId}`);
  }

  /**
   * Get all badges
   */
  getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }
}

// Export singleton instance
export const inlineAnnotator = new InlineAnnotator();
