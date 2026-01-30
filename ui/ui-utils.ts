/**
 * UI Utilities - Helper functions for UI management
 * 
 * Orchestrates all UI components working together
 */

import type { FileAnalysisResults } from '../types';
import { inlineAnnotator } from './inline-annotator';
import { summaryPanel } from './summary-panel';
import { tooltipManager } from './tooltip';
import { initKeyboardNavigation, destroyKeyboardNavigation } from './keyboard-handler';
import { initQuickComments, destroyQuickComments } from './quick-comments';

/**
 * UI System - Manages all UI components
 */
export class UISystem {
  private isInitialized = false;
  private styleElement: HTMLStyleElement | null = null;

  /**
   * Initialize the UI system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Inject CSS
      await this.injectStyles();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize keyboard navigation
      initKeyboardNavigation();

      // Initialize quick comments
      initQuickComments();

      this.isInitialized = true;
      console.log('✅ UI System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize UI system:', error);
    }
  }

  /**
   * Inject CSS styles into page
   */
  private async injectStyles(): Promise<void> {
    // Dynamically import CSS (this will work after build)
    try {
      const cssFile = chrome.runtime.getURL('ui/ui-styles.css');
      const response = await fetch(cssFile);
      const css = await response.text();

      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);

      this.styleElement = style;
      console.log('✅ CSS styles injected');
    } catch (error) {
      // Fallback: inject minimal inline styles
      console.warn('⚠️ Failed to load external CSS, using fallback styles');
      this.injectFallbackStyles();
    }
  }

  /**
   * Inject fallback CSS (minimal critical styles)
   */
  private injectFallbackStyles(): void {
    const fallbackCSS = `
      .cra-badge { 
        display: inline-block; 
        margin-left: 8px; 
        padding: 2px 6px; 
        border-radius: 3px; 
        font-size: 12px; 
        cursor: pointer; 
      }
      .cra-badge--critical { background: #DC3545; color: white; }
      .cra-badge--warning { background: #FFC107; color: #333; }
      .cra-badge--info { background: #17A2B8; color: white; }
      
      .cra-tooltip { 
        position: fixed; 
        background: white; 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        padding: 12px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
        z-index: 10001; 
        max-width: 350px;
        font-size: 13px;
      }
      
      .cra-panel { 
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        width: 380px; 
        max-height: 600px; 
        background: white; 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
        z-index: 10000; 
      }
      
      .cra-line-highlighted { background: #FFF8DC !important; }
    `;

    const style = document.createElement('style');
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
    this.styleElement = style;
  }

  /**
   * Setup event listeners for UI interactions
   */
  private setupEventListeners(): void {
    // Close tooltips when clicking elsewhere
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.cra-badge') && !target.closest('.cra-tooltip')) {
        tooltipManager.hideAll();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close panel
      if (e.key === 'Escape') {
        summaryPanel.hide();
        tooltipManager.hideAll();
      }

      // Ctrl+Shift+R to toggle panel
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        summaryPanel.toggle();
      }
    });
  }

  /**
   * Render analysis results with UI
   */
  renderResults(results: FileAnalysisResults[]): void {
    if (!this.isInitialized) {
      console.warn('⚠️ UI System not initialized');
      return;
    }

    try {
      // Clear previous UI
      this.clear();

      // Render inline badges
      inlineAnnotator.renderBadges(results);

      // Setup badge click handlers
      const badges = document.querySelectorAll('.cra-badge');
      for (const badge of badges) {
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          const ruleId = badge.getAttribute('data-rule-id');
          const lineText = badge.closest('tr')?.textContent || '';
          
          // Find the corresponding result
          for (const fileResult of results) {
            for (const result of fileResult.results) {
              if (result.ruleId === ruleId) {
                tooltipManager.show(result, badge as HTMLElement);
                return;
              }
            }
          }
        });

        // Show tooltip on hover (optional)
        badge.addEventListener('mouseenter', (e) => {
          const ruleId = badge.getAttribute('data-rule-id');
          for (const fileResult of results) {
            for (const result of fileResult.results) {
              if (result.ruleId === ruleId) {
                tooltipManager.show(result, badge as HTMLElement);
                return;
              }
            }
          }
        });
      }

      // Initialize summary panel
      summaryPanel.setResults(results);
      summaryPanel.show();

      // Setup issue click handler
      summaryPanel.onIssueSelected((result) => {
        inlineAnnotator.highlightLine(result.lineNumber);
      });

      console.log(`✅ Rendered ${results.length} files with ${results.reduce((sum, f) => sum + f.results.length, 0)} issues`);
    } catch (error) {
      console.error('❌ Failed to render results:', error);
    }
  }

  /**
   * Clear all UI elements
   */
  clear(): void {
    inlineAnnotator.clear();
    tooltipManager.hideAll();
    summaryPanel.hide();
  }

  /**
   * Show summary panel
   */
  showPanel(): void {
    summaryPanel.show();
  }

  /**
   * Hide summary panel
   */
  hidePanel(): void {
    summaryPanel.hide();
  }

  /**
   * Toggle summary panel
   */
  togglePanel(): void {
    summaryPanel.toggle();
  }

  /**
   * Highlight a specific line
   */
  highlightLine(lineNumber: number): void {
    inlineAnnotator.highlightLine(lineNumber);
  }

  /**
   * Clear line highlighting
   */
  clearHighlight(): void {
    inlineAnnotator.clearHighlight();
  }

  /**
   * Export findings as markdown
   */
  exportMarkdown(): string {
    return summaryPanel.getMarkdownExport();
  }

  /**
   * Destroy the entire UI system
   */
  destroy(): void {
    this.clear();
    summaryPanel.destroy();

    // Cleanup keyboard navigation
    destroyKeyboardNavigation();

    // Cleanup quick comments
    destroyQuickComments();

    // Remove injected CSS
    if (this.styleElement?.parentElement) {
      this.styleElement.remove();
    }

    this.isInitialized = false;
  }

  /**
   * Check if UI is initialized
   */
  getInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const uiSystem = new UISystem();

/**
 * Initialization helper for content script
 */
export async function initializeUI(): Promise<UISystem> {
  await uiSystem.initialize();
  return uiSystem;
}

/**
 * Helper to show a simple notification
 */
export function showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
  const colors: Record<string, string> = {
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
  };

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 10002;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

/**
 * Check if we're on a GitHub PR page
 */
export function isGitHubPRPage(): boolean {
  return /github\.com\/.*\/pull\/\d+\/files/i.test(window.location.href);
}

/**
 * Get the PR number from URL
 */
export function getPRNumber(): number | null {
  const match = window.location.href.match(/pull\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Get the repository from URL
 */
export function getRepository(): string | null {
  const match = window.location.href.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : null;
}
