/**
 * Service Worker for GitHub Code Review Assistant
 * Handles message routing and state management
 */

import type {
  ExtensionMessage,
  AnalyzeMessage,
  FileAnalysisResults,
  ExtensionSettings,
  Rule,
  Language,
} from './types';

// Global state
let cachedRules: Map<Language, Rule[]> = new Map();
let cachedSettings: ExtensionSettings | null = null;

/**
 * Initialize default settings
 */
async function initializeSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get('settings');
  
  if (result.settings) {
    cachedSettings = result.settings;
    return result.settings;
  }
  
  const defaultSettings: ExtensionSettings = {
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
async function getSettings(): Promise<ExtensionSettings> {
  if (cachedSettings) return cachedSettings;
  return initializeSettings();
}

/**
 * Update settings
 */
async function updateSettings(settings: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.local.set({ settings: updated });
  cachedSettings = updated;
  return updated;
}

/**
 * Get rules for a specific language (empty for now, will be populated in Phase 2)
 */
async function getRulesForLanguage(language: Language): Promise<Rule[]> {
  if (cachedRules.has(language)) {
    return cachedRules.get(language) || [];
  }
  
  // For Phase 1, return empty array
  // This will be populated with actual rules in Phase 2
  const rules: Rule[] = [];
  cachedRules.set(language, rules);
  return rules;
}

/**
 * Get all enabled rules
 */
async function getEnabledRules(): Promise<Rule[]> {
  const settings = await getSettings();
  
  // Collect all rules from all languages
  const languages: Language[] = ['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx', 'csharp'];
  const allRules: Rule[] = [];
  
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
 * Analyze code against rules (Phase 2+)
 */
async function analyzeCodeImpl(
  code: string,
  language: Language,
  filePath: string
): Promise<FileAnalysisResults | null> {
  try {
    // Dynamically import analyzer and rules to avoid circular dependencies
    const { analyzeCode: analyze } = await import('./analyzer');
    const { getAllRules } = await import('./rules/index');
    
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
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  if (message.type === 'analyze') {
    const analyzeMsg = message as AnalyzeMessage;
    analyzeCodeImpl(
      analyzeMsg.payload?.code as string || '',
      analyzeMsg.payload?.language as Language || 'javascript',
      analyzeMsg.payload?.filePath as string || ''
    )
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
    const payload = message.payload as { settings: Partial<ExtensionSettings> };
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
