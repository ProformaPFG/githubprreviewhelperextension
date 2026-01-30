/**
 * Popup Script for GitHub Code Review Assistant
 * Handles popup UI interactions and communication with content script
 */

/**
 * Check if we're on a GitHub PR files page
 */
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return { isOnPR: false, tab: null };

    const isOnPR = /github\.com\/.*\/.*\/pull\/\d+\/(files|changes)/.test(tab.url);
    return { isOnPR, tab };
  } catch (error) {
    console.error('Error checking tab:', error);
    return { isOnPR: false, tab: null };
  }
}

/**
 * Send message to content script
 */
async function sendToContentScript(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Render the "not on PR" state
 */
function renderNotOnPR() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="not-on-pr">
      <p>Navigate to a GitHub Pull Request's "Files changed" tab to use this extension.</p>
      <p><a href="https://github.com/pulls" target="_blank">View your Pull Requests</a></p>
    </div>
    <div class="footer-links">
      <a href="options.html" target="_blank">Settings</a>
      <a href="https://github.com" target="_blank">Help</a>
    </div>
  `;
}

/**
 * Render the main popup content
 */
function renderMainContent(isAnalyzing = false) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="status">
      <div class="status-item">
        <div class="status-indicator ${isAnalyzing ? '' : 'idle'}"></div>
        <span class="status-text">${isAnalyzing ? 'Analyzing code...' : 'Ready to analyze'}</span>
      </div>
    </div>

    <div class="button-group">
      <button id="analyzeBtn" class="primary" ${isAnalyzing ? 'disabled' : ''}>
        ${isAnalyzing ? '<span class="spinner"></span>Analyzing...' : 'Analyze Code'}
      </button>
    </div>

    <div class="quick-settings">
      <h3>Quick Settings</h3>
      <label class="setting-item">
        <input type="checkbox" id="securityCheck" checked>
        <span class="setting-label">Security issues</span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="debugCheck" checked>
        <span class="setting-label">Debug statements</span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="consoleCheck" checked>
        <span class="setting-label">Console logs</span>
      </label>
    </div>

    <div class="footer-links">
      <a href="options.html" target="_blank">Settings</a>
      <a href="https://github.com" target="_blank">Help</a>
    </div>
  `;

  // Add event listener to analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn && !isAnalyzing) {
    analyzeBtn.addEventListener('click', handleAnalyze);
  }
}

/**
 * Handle analyze button click
 */
async function handleAnalyze() {
  const { isOnPR, tab } = await checkCurrentTab();
  if (!isOnPR || !tab?.id) return;

  renderMainContent(true);

  try {
    const response = await sendToContentScript(tab.id, { type: 'analyze' });
    console.log('Analysis response:', response);

    // Show completion state
    renderMainContent(false);
  } catch (error) {
    console.error('Analysis error:', error);
    renderMainContent(false);
  }
}

/**
 * Initialize popup
 */
async function initialize() {
  const { isOnPR } = await checkCurrentTab();

  if (isOnPR) {
    renderMainContent();
  } else {
    renderNotOnPR();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);
