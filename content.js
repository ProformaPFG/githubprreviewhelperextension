/**
 * Content Script for GitHub Code Review Assistant
 * Runs on GitHub PR file diff pages
 * Responsible for: DOM observation, code extraction, UI injection
 */

/**
 * Send message to service worker and wait for response
 */
function sendMessageToBackground(message) {
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
      
      resolve(response.data);
    });
  });
}

/**
 * Check if we're on a GitHub PR files page
 */
function isGitHubPRFilesPage() {
  const url = window.location.href;
  return /github\.com\/.*\/.*\/pull\/\d+\/(files|changes)/.test(url);
}

/**
 * Extract code from all visible diffs on the page
 */
function extractAllCodeFromPage() {
  const files = [];
  
  try {
    // Find all file containers
    const fileElements = document.querySelectorAll('[data-path]');
    
    fileElements.forEach(fileElement => {
      const filePath = fileElement.getAttribute('data-path');
      if (!filePath) return;
      
      // Extract file language from extension
      const ext = filePath.split('.').pop().toLowerCase();
      const language = getLanguageFromExtension(ext);
      
      // Extract code lines
      const lines = [];
      const tableBody = fileElement.querySelector('tbody');
      
      if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
          const codeCell = row.querySelector('[data-code-cell]') || row.querySelector('td:last-child');
          if (codeCell) {
            const content = codeCell.textContent || '';
            const isDiffAdded = row.classList.contains('addition') || row.classList.contains('add');
            const isDiffRemoved = row.classList.contains('deletion') || row.classList.contains('remove');
            
            lines.push({
              lineNumber: index + 1,
              content: content,
              isDiffAdded: isDiffAdded,
              isDiffRemoved: isDiffRemoved,
            });
          }
        });
      }
      
      if (lines.length > 0) {
        files.push({
          filePath: filePath,
          language: language,
          lines: lines,
        });
      }
    });
  } catch (error) {
    console.error('Error extracting code from page:', error);
  }
  
  return files;
}

/**
 * Get language from file extension
 */
function getLanguageFromExtension(ext) {
  const extensionMap = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'less': 'css',
    'cs': 'csharp',
    'java': 'java',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'go': 'go',
    'rs': 'rust',
  };
  
  return extensionMap[ext] || 'text';
}

/**
 * Extract and analyze code on page
 */
async function analyzePageCode() {
  try {
    if (!isGitHubPRFilesPage()) {
      console.log('Not on a GitHub PR files page');
      return;
    }
    
    // Extract code from all visible diffs
    const extractedFiles = extractAllCodeFromPage();
    console.log(`Extracted ${extractedFiles.length} files from page`, extractedFiles);
    
    // Log extracted code for debugging
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
function addDebugMarker() {
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
function setupPageObserver() {
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
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
function initialize() {
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
