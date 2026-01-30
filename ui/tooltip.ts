/**
 * Tooltip Component - Shows detailed information about an issue
 * 
 * Displays:
 * - Rule name and ID
 * - Issue description
 * - Matched code
 * - Remediation guidance
 * - Action buttons (Copy, Learn More, Dismiss)
 */

import type { AnalysisResult } from '../types.js';

/**
 * Tooltip class
 */
export class Tooltip {
  private element: HTMLElement | null = null;
  private isVisible = false;
  private result: AnalysisResult;

  constructor(result: AnalysisResult) {
    this.result = result;
  }

  /**
   * Create tooltip HTML element
   */
  create(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cra-tooltip';
    container.setAttribute('data-rule-id', this.result.ruleId);

    // Severity icon
    const icons: Record<string, string> = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️',
    };
    const icon = icons[this.result.severity] || '◆';

    // Header
    const header = document.createElement('div');
    header.className = 'cra-tooltip__header';
    header.innerHTML = `
      <span class="cra-severity-icon">${icon}</span>
      <strong>${this.result.ruleName}</strong>
      <span class="cra-rule-id">${this.result.ruleId}</span>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'cra-tooltip__body';

    // Message
    const message = document.createElement('p');
    message.className = 'cra-tooltip__message';
    message.textContent = this.result.message;
    body.appendChild(message);

    // Code snippet
    const codeContainer = document.createElement('div');
    codeContainer.className = 'cra-tooltip__code';
    const codeElement = document.createElement('code');
    codeElement.textContent = this.result.code;
    codeContainer.appendChild(codeElement);
    body.appendChild(codeContainer);

    // Remediation
    if (this.result.remediation) {
      const remediationLabel = document.createElement('strong');
      remediationLabel.textContent = 'Remediation:';
      remediationLabel.className = 'cra-tooltip__label';
      body.appendChild(remediationLabel);

      const remediationText = document.createElement('p');
      remediationText.className = 'cra-tooltip__remediation';
      remediationText.textContent = this.result.remediation;
      body.appendChild(remediationText);
    }

    // Footer with buttons
    const footer = document.createElement('div');
    footer.className = 'cra-tooltip__footer';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'cra-btn cra-btn--small';
    copyBtn.textContent = '📋 Copy';
    copyBtn.onclick = () => this.copyToClipboard();

    const learnBtn = document.createElement('button');
    learnBtn.className = 'cra-btn cra-btn--small';
    learnBtn.textContent = '📖 Learn More';
    learnBtn.onclick = () => this.openDocumentation();

    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'cra-btn cra-btn--small cra-btn--dismiss';
    dismissBtn.textContent = '❌ Dismiss';
    dismissBtn.onclick = () => this.hide();

    footer.appendChild(copyBtn);
    footer.appendChild(learnBtn);
    footer.appendChild(dismissBtn);

    // Assemble tooltip
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    this.element = container;
    return container;
  }

  /**
   * Show tooltip near a target element
   */
  show(target: HTMLElement): void {
    if (!this.element) {
      this.create();
    }

    if (!this.element) return;

    // Add to DOM if not already there
    if (!this.element.parentElement) {
      document.body.appendChild(this.element);
    }

    // Position near target
    this.position(target);

    // Show with animation
    this.element.classList.add('cra-tooltip--visible');
    this.isVisible = true;
  }

  /**
   * Hide tooltip
   */
  hide(): void {
    if (!this.element) return;

    this.element.classList.remove('cra-tooltip--visible');
    this.isVisible = false;

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.element?.parentElement) {
        this.element.remove();
      }
    }, 300);
  }

  /**
   * Position tooltip near target element
   */
  position(target: HTMLElement): void {
    if (!this.element) return;

    const rect = target.getBoundingClientRect();
    const tooltipRect = this.element.getBoundingClientRect();

    let left = rect.right + 10;
    let top = rect.top;

    // Adjust if tooltip goes off-screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = rect.left - tooltipRect.width - 10;
    }

    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - 10;
    }

    if (top < 0) {
      top = 10;
    }

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  /**
   * Copy issue details to clipboard
   */
  private copyToClipboard(): void {
    const text = `
Issue: ${this.result.ruleName} (${this.result.ruleId})
Severity: ${this.result.severity}
Line: ${this.result.lineNumber}

Description: ${this.result.message}

Code: ${this.result.code}

${this.result.remediation ? `Remediation: ${this.result.remediation}` : ''}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      // Show copied message
      const btn = this.element?.querySelector('.cra-btn:first-child');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    });
  }

  /**
   * Open documentation (placeholder for Phase 5)
   */
  private openDocumentation(): void {
    // Phase 5: Open documentation link
    alert(`Learn more about ${this.result.ruleId}: ${this.result.ruleName}`);
  }

  /**
   * Check if tooltip is visible
   */
  isShown(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy tooltip
   */
  destroy(): void {
    this.hide();
    if (this.element?.parentElement) {
      this.element.remove();
    }
    this.element = null;
  }
}

/**
 * Tooltip manager - handles multiple tooltips
 */
export class TooltipManager {
  private tooltips: Map<string, Tooltip> = new Map();
  private activeTooltip: Tooltip | null = null;

  /**
   * Show tooltip for a result
   */
  show(result: AnalysisResult, target: HTMLElement): Tooltip {
    const key = `${result.lineNumber}:${result.ruleId}`;

    // Hide previous tooltip
    if (this.activeTooltip) {
      this.activeTooltip.hide();
    }

    // Reuse or create tooltip
    let tooltip = this.tooltips.get(key);
    if (!tooltip) {
      tooltip = new Tooltip(result);
      this.tooltips.set(key, tooltip);
    }

    tooltip.show(target);
    this.activeTooltip = tooltip;

    return tooltip;
  }

  /**
   * Hide all tooltips
   */
  hideAll(): void {
    for (const tooltip of this.tooltips.values()) {
      if (tooltip.isShown()) {
        tooltip.hide();
      }
    }
    this.activeTooltip = null;
  }

  /**
   * Clear all tooltips
   */
  clear(): void {
    for (const tooltip of this.tooltips.values()) {
      tooltip.destroy();
    }
    this.tooltips.clear();
    this.activeTooltip = null;
  }
}

// Export singleton instance
export const tooltipManager = new TooltipManager();
