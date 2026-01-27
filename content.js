/**
 * Content Script for GitHub Code Review Assistant
 * Runs on GitHub PR file diff pages
 * Responsible for: DOM observation, code extraction, UI injection
 */

import {
  isGitHubPRFilesPage,
  extractAllCodeFromPage,
  getPRUrl,
} from './utils/dom';
import type { ExtractedCode, ExtensionMessage } from './types';

/**
 * Send message to service worker and wait for response
 */
function sendMessageToBackground<T>(message: ExtensionMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      if (response?.success === false) {
        reject(new Error(response.error || 'Unknown error'));
        return;
      }
      
      resolve(response.data as T);
    });
  });
}

/**
 * Extract and analyze code on page
 */
async function analyzePageCode(): Promise<void> {
  try {
    if (!isGitHubPRFilesPage()) {
      console.log('Not on a GitHub PR files page');
      return;
    }
    
    // Extract code from all visible diffs
    const extractedFiles: ExtractedCode[] = extractAllCodeFromPage();
    console.log(`Extracted ${extractedFiles.length} files from page`, extractedFiles);
    
    // For Phase 1, we just log the extracted code
    // The actual analysis will happen in Phase 2
    extractedFiles.forEach(file => {
      console.log(`File: ${file.filePath} (${file.language})`);
      console.log(`  Lines: ${file.lines.length}`);
      console.log(`  Added lines: ${file.lines.filter(l => l.isDiffAdded).length}`);
      console.log(`  Removed lines: ${file.lines.filter(l => l.isDiffRemoved).length}`);
      
      // Log first few lines for debugging
      file.lines.slice(0, 5).forEach(line => {
        console.log(`    Line ${line.lineNumber}: ${line.content.substring(0, 60)}...`);
      });
    });
    
    // Display a debug marker to show the extension is working
    addDebugMarker();
    
  } catch (error) {
    console.error('Error analyzing page:', error);
  }
}

/**
 * Add a debug marker to the page to show extension is active
 */
function addDebugMarker(): void {
  const existingMarker = document.getElementById('gcra-debug-marker');
  if (existingMarker) return;
  
  const marker = document.createElement('div');
  marker.id = 'gcra-debug-marker';
  marker.textContent = '✓ GitHub Code Review Assistant Active';
  marker.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
    background-color: #238636;
    color: white;
    border-radius: 6px;
    font-size: 12px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  `;
  document.body.appendChild(marker);
}

/**
 * Watch for page changes and re-analyze when needed
 */
function setupPageObserver(): void {
  // GitHub uses dynamic loading for diffs, so we need to observe DOM changes
  const observer = new MutationObserver((mutations) => {
    // Check if diff content was added
    const hasDiffChanges = mutations.some(m =>
      m.type === 'childList' &&
      (m.addedNodes.length > 0 || m.removedNodes.length > 0) &&
      Array.from(m.addedNodes).some(node =>
        node instanceof Element && (
          node.classList.contains('diff-table') ||
          node.classList.contains('file-header') ||
          node.hasAttribute('data-path')
        )
      )
    );
    
    if (hasDiffChanges) {
      console.log('Page content changed, re-analyzing...');
      analyzePageCode();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
  
  console.log('Page observer installed');
}

/**
 * Listen for messages from popup or background
 */
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'analyze') {
      // Trigger analysis from popup
      analyzePageCode()
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
function initialize(): void {
  console.log('GitHub Code Review Assistant content script loaded');
  
  if (!isGitHubPRFilesPage()) {
    console.log('Not on a GitHub PR files page, exiting');
    return;
  }
  
  // Initial analysis
  analyzePageCode();
  
  // Setup observers and listeners
  setupPageObserver();
  setupMessageListener();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
