/**
 * Settings Manager - Handles all user preferences and settings
 * 
 * Manages:
 * - Enabled/disabled rules
 * - Custom rules
 * - GitHub Enterprise domains
 * - Analysis settings
 * - UI preferences
 */

// Types imported implicitly

/**
 * Settings interface
 */
export interface ExtensionSettings {
  // Rule management
  enabledRuleIds: string[];
  enableSecurityRules: boolean;
  enableDebugRules: boolean;
  customRules: Rule[];

  // GitHub configuration
  githubEnterpriseDomains: string[];
  analyzePrivateRepos: boolean;

  // Analysis settings
  analysisTimeout: number;
  maxFileSize: number;

  // UI preferences
  darkModeEnabled: boolean;
  autoShowPanel: boolean;
  showLineNumbers: boolean;

  // Privacy
  collectAnalytics: boolean;
  sendErrorReports: boolean;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: ExtensionSettings = {
  // Rule management
  enabledRuleIds: [], // Empty means all rules enabled
  enableSecurityRules: true,
  enableDebugRules: true,
  customRules: [],

  // GitHub configuration
  githubEnterpriseDomains: [],
  analyzePrivateRepos: true,

  // Analysis settings
  analysisTimeout: 5000, // 5 seconds
  maxFileSize: 100000, // 100KB

  // UI preferences
  darkModeEnabled: true,
  autoShowPanel: true,
  showLineNumbers: false,

  // Privacy
  collectAnalytics: false,
  sendErrorReports: true,
};

/**
 * Settings Manager class
 */
export class SettingsManager {
  private cache: ExtensionSettings | null = null;
  private storageKey = 'cra-settings';
  private initialized = false;

  /**
   * Initialize settings from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await chrome.storage.local.get(this.storageKey);
      if (stored[this.storageKey]) {
        this.cache = { ...DEFAULT_SETTINGS, ...stored[this.storageKey] };
      } else {
        this.cache = { ...DEFAULT_SETTINGS };
      }
      this.initialized = true;
      console.log('✅ Settings initialized');
    } catch (error) {
      console.error('❌ Failed to initialize settings:', error);
      this.cache = { ...DEFAULT_SETTINGS };
      this.initialized = true;
    }
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<ExtensionSettings> {
    if (!this.initialized) {
      await this.initialize();
    }
    return { ...this.cache! };
  }

  /**
   * Get a specific setting
   */
  async get<K extends keyof ExtensionSettings>(
    key: K
  ): Promise<ExtensionSettings[K]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cache![key];
  }

  /**
   * Set a specific setting
   */
  async set<K extends keyof ExtensionSettings>(
    key: K,
    value: ExtensionSettings[K]
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.cache![key] = value;

    try {
      await chrome.storage.local.set({
        [this.storageKey]: this.cache,
      });
      console.log(`✅ Setting saved: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to save setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set multiple settings at once
   */
  async setMultiple(
    updates: Partial<ExtensionSettings>
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.cache = { ...this.cache!, ...updates };

    try {
      await chrome.storage.local.set({
        [this.storageKey]: this.cache,
      });
      console.log('✅ Multiple settings saved');
    } catch (error) {
      console.error('❌ Failed to save multiple settings:', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.cache = { ...DEFAULT_SETTINGS };

    try {
      await chrome.storage.local.set({
        [this.storageKey]: this.cache,
      });
      console.log('✅ Settings reset to defaults');
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      throw error;
    }
  }

  /**
   * Enable a rule
   */
  async enableRule(ruleId: string): Promise<void> {
    const enabledIds = this.cache?.enabledRuleIds || [];
    if (!enabledIds.includes(ruleId)) {
      enabledIds.push(ruleId);
      await this.set('enabledRuleIds', enabledIds);
    }
  }

  /**
   * Disable a rule
   */
  async disableRule(ruleId: string): Promise<void> {
    const enabledIds = this.cache?.enabledRuleIds || [];
    const filtered = enabledIds.filter(id => id !== ruleId);
    await this.set('enabledRuleIds', filtered);
  }

  /**
   * Check if a rule is enabled
   */
  async isRuleEnabled(ruleId: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    const enabledIds = this.cache?.enabledRuleIds;
    
    // If empty array, all rules are enabled
    if (enabledIds && enabledIds.length === 0) {
      return true;
    }

    return enabledIds?.includes(ruleId) ?? true;
  }

  /**
   * Add a custom rule
   */
  async addCustomRule(rule: Rule): Promise<void> {
    const customRules = this.cache?.customRules || [];
    customRules.push(rule);
    await this.set('customRules', customRules);
  }

  /**
   * Remove a custom rule
   */
  async removeCustomRule(ruleId: string): Promise<void> {
    const customRules = this.cache?.customRules || [];
    const filtered = customRules.filter(r => r.id !== ruleId);
    await this.set('customRules', filtered);
  }

  /**
   * Add GitHub Enterprise domain
   */
  async addEnterpriseDomain(domain: string): Promise<void> {
    const domains = this.cache?.githubEnterpriseDomains || [];
    if (!domains.includes(domain)) {
      domains.push(domain);
      await this.set('githubEnterpriseDomains', domains);
    }
  }

  /**
   * Remove GitHub Enterprise domain
   */
  async removeEnterpriseDomain(domain: string): Promise<void> {
    const domains = this.cache?.githubEnterpriseDomains || [];
    const filtered = domains.filter(d => d !== domain);
    await this.set('githubEnterpriseDomains', filtered);
  }

  /**
   * Export settings as JSON
   */
  async exportSettings(): Promise<string> {
    const settings = await this.getAll();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(jsonString: string): Promise<void> {
    try {
      const imported = JSON.parse(jsonString);
      
      // Validate the imported settings
      const validated = this.validateSettings(imported);
      
      // Merge with defaults to ensure all keys exist
      const merged = { ...DEFAULT_SETTINGS, ...validated };
      
      await this.setMultiple(merged);
      console.log('✅ Settings imported successfully');
    } catch (error) {
      console.error('❌ Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  /**
   * Validate settings object
   */
  private validateSettings(
    settings: any
  ): Partial<ExtensionSettings> {
    const validated: Partial<ExtensionSettings> = {};

    // Validate arrays
    if (Array.isArray(settings.enabledRuleIds)) {
      validated.enabledRuleIds = settings.enabledRuleIds;
    }

    if (Array.isArray(settings.customRules)) {
      validated.customRules = settings.customRules;
    }

    if (Array.isArray(settings.githubEnterpriseDomains)) {
      validated.githubEnterpriseDomains = settings.githubEnterpriseDomains;
    }

    // Validate booleans
    if (typeof settings.enableSecurityRules === 'boolean') {
      validated.enableSecurityRules = settings.enableSecurityRules;
    }

    if (typeof settings.enableDebugRules === 'boolean') {
      validated.enableDebugRules = settings.enableDebugRules;
    }

    if (typeof settings.analyzePrivateRepos === 'boolean') {
      validated.analyzePrivateRepos = settings.analyzePrivateRepos;
    }

    if (typeof settings.darkModeEnabled === 'boolean') {
      validated.darkModeEnabled = settings.darkModeEnabled;
    }

    if (typeof settings.autoShowPanel === 'boolean') {
      validated.autoShowPanel = settings.autoShowPanel;
    }

    if (typeof settings.showLineNumbers === 'boolean') {
      validated.showLineNumbers = settings.showLineNumbers;
    }

    if (typeof settings.collectAnalytics === 'boolean') {
      validated.collectAnalytics = settings.collectAnalytics;
    }

    if (typeof settings.sendErrorReports === 'boolean') {
      validated.sendErrorReports = settings.sendErrorReports;
    }

    // Validate numbers
    if (typeof settings.analysisTimeout === 'number') {
      validated.analysisTimeout = Math.max(1000, settings.analysisTimeout);
    }

    if (typeof settings.maxFileSize === 'number') {
      validated.maxFileSize = Math.max(1000, settings.maxFileSize);
    }

    return validated;
  }

  /**
   * Listen for settings changes
   */
  onChange(callback: (settings: ExtensionSettings) => void): void {
    chrome.storage.local.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[this.storageKey]) {
        const newSettings = changes[this.storageKey].newValue;
        if (newSettings) {
          this.cache = newSettings;
          callback(newSettings);
          console.log('✅ Settings updated from storage');
        }
      }
    });
  }

  /**
   * Clear all settings
   */
  async clear(): Promise<void> {
    this.cache = null;
    this.initialized = false;

    try {
      await chrome.storage.local.remove(this.storageKey);
      console.log('✅ Settings cleared');
    } catch (error) {
      console.error('❌ Failed to clear settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const settingsManager = new SettingsManager();
