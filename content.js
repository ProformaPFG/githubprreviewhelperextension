/**
 * Content Script for GitHub Code Review Assistant
 * Runs on GitHub PR file diff pages.
 * ES module — imports from compiled TypeScript UI/analysis pipeline.
 */

import { extractAllCodeFromPage, isGitHubPRFilesPage } from './utils/dom.js';
import { analyzeWithSettings } from './analysis-integration.js';
import { initializeUI, uiSystem } from './ui/ui-utils.js';

let observer = null;

/**
 * Show a small persistent status badge (bottom-right corner)
 */
function showStatusBadge(text, color = '#238636') {
  const existing = document.getElementById('cra-status-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'cra-status-badge';
  badge.textContent = text;
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 12px;
    background: ${color};
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    z-index: 10000;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    cursor: default;
  `;
  document.body.appendChild(badge);
}

/**
 * Run full analysis pipeline and render results
 */
async function runAnalysis() {
  try {
    if (!isGitHubPRFilesPage()) return;

    const extractedFiles = extractAllCodeFromPage();

    if (extractedFiles.length === 0) {
      console.log('[CRA] No supported files found in diff');
      showStatusBadge('✓ CRA Active — no supported files in this diff', '#57606a');
      return;
    }

    console.log(`[CRA] Analyzing ${extractedFiles.length} file(s)...`);
    showStatusBadge(`⏳ CRA: Analyzing ${extractedFiles.length} file(s)...`, '#bf8700');

    const allResults = await Promise.all(
      extractedFiles.map(file => {
        const code = file.lines.map(l => l.content).join('\n');
        return analyzeWithSettings(code, file.language, file.filePath);
      })
    );

    const totalIssues = allResults.reduce((sum, r) => sum + r.results.length, 0);
    uiSystem.renderResults(allResults);

    const badgeColor = totalIssues === 0 ? '#238636' : '#cf222e';
    showStatusBadge(`${totalIssues === 0 ? '✓' : '⚠'} CRA: ${totalIssues} issue${totalIssues === 1 ? '' : 's'} found`, badgeColor);
    console.log('[CRA] Analysis complete');
  } catch (error) {
    console.error('[CRA] Analysis failed:', error);
    showStatusBadge('✗ CRA: Analysis failed — see console', '#cf222e');
  }
}

/**
 * Watch for page changes (GitHub loads diffs dynamically)
 */
function setupPageObserver() {
  observer = new MutationObserver((mutations) => {
    const hasDiffChanges = mutations.some(m =>
      m.type === 'childList' &&
      Array.from(m.addedNodes).some(node =>
        node instanceof Element && (
          node.classList.contains('diff-table') ||
          node.classList.contains('file-header') ||
          node.hasAttribute('data-path')
        )
      )
    );

    if (hasDiffChanges) {
      runAnalysis();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Cleanup on navigation to prevent memory leak
  window.addEventListener('beforeunload', () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    uiSystem.destroy();
  });
}

/**
 * Listen for messages from popup or background
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'analyze') {
      runAnalysis()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }

    sendResponse({ success: false, error: 'Unknown message type' });
  });
}

/**
 * Initialize content script
 */
async function initialize() {
  if (!isGitHubPRFilesPage()) return;

  console.log('[CRA] Initializing on', window.location.href);
  showStatusBadge('⏳ CRA: Initializing...', '#bf8700');

  await initializeUI();
  await runAnalysis();
  setupPageObserver();
  setupMessageListener();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
