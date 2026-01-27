/**
 * Service Worker for GitHub Code Review Assistant
 * Handles message routing and state management
 */

// Global state
let cachedRules = new Map();
let cachedSettings = null;

/**
 * Initialize default settings
 */
async function initializeSettings() {
  const result = await chrome.storage.local.get('settings');
  
  if (result.settings) {
    cachedSettings = result.settings;
    return result.settings;
  }
  
  const defaultSettings = {
    enabledRuleIds: [],
    customRules: [],
    githubEnterpriseUrls: [],
    debugMode: false,
  };
  
  await chrome.storage.local.set({ settings: defaultSettings });
  cachedSettings = defaultSettings;
  return defaultSettings;
}

/**
 * Get current settings
 */
async function getSettings() {
  if (cachedSettings) return cachedSettings;
  return initializeSettings();
}

/**
 * Update settings
 */
async function updateSettings(settings) {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.local.set({ settings: updated });
  cachedSettings = updated;
  return updated;
}

/**
 * Get rules for a specific language
 */
async function getRulesForLanguage(language) {
  if (cachedRules.has(language)) {
    return cachedRules.get(language) || [];
  }
  
  const rules = [];
  cachedRules.set(language, rules);
  return rules;
}

/**
 * Get all enabled rules
 */
async function getEnabledRules() {
  const settings = await getSettings();
  
  // Collect all rules from all languages
  const languages = ['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx', 'csharp'];
  const allRules = [];
  
  for (const lang of languages) {
    const rules = await getRulesForLanguage(lang);
    allRules.push(...rules);
  }
  
  // Filter enabled rules and include custom rules
  const enabledRules = allRules.filter(rule => settings.enabledRuleIds.includes(rule.id));
  enabledRules.push(...settings.customRules);
  
  return enabledRules;
}

/**
 * Analyze code against rules
 */
async function analyzeCodeImpl(code, language, filePath) {
  try {
    // Dynamically import analyzer and rules
    const { analyzeCode: analyze } = await import('./analyzer.js');
    const { getAllRules } = await import('./rules/index.js');
    
    const rules = getAllRules();
    const results = analyze(code, language, rules, filePath);
    
    return results;
  } catch (error) {
    console.error('Error during code analysis:', error);
    return {
      filePath,
      language,
      results: [],
    };
  }
}

/**
 * Handle messages from content script and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'analyze') {
    const code = message.payload?.code || '';
    const language = message.payload?.language || 'javascript';
    const filePath = message.payload?.filePath || '';
    
    analyzeCodeImpl(code, language, filePath)
      .then(results => sendResponse({ success: true, data: results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'getSettings') {
    getSettings()
      .then(settings => sendResponse({ success: true, data: settings }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'updateSettings') {
    const payload = message.payload;
    updateSettings(payload.settings)
      .then(settings => sendResponse({ success: true, data: settings }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'getRules') {
    getEnabledRules()
      .then(rules => sendResponse({ success: true, data: rules }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  sendResponse({ success: false, error: 'Unknown message type' });
});

/**
 * Initialize on service worker startup
 */
console.log('GitHub Code Review Assistant service worker loaded');
initializeSettings();
