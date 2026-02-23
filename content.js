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
 * Run full analysis pipeline and render results
 */
async function runAnalysis() {
  try {
    if (!isGitHubPRFilesPage()) return;

    const extractedFiles = extractAllCodeFromPage();
    if (extractedFiles.length === 0) {
      console.log('[CRA] No supported files found in diff');
      return;
    }

    console.log(`[CRA] Analyzing ${extractedFiles.length} file(s)...`);

    const allResults = await Promise.all(
      extractedFiles.map(file => {
        const code = file.lines.map(l => l.content).join('\n');
        return analyzeWithSettings(code, file.language, file.filePath);
      })
    );

    uiSystem.renderResults(allResults);
    console.log('[CRA] Analysis complete');
  } catch (error) {
    console.error('[CRA] Analysis failed:', error);
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
