/**
 * Type definitions for the GitHub Code Review Assistant extension
 */

export type Language = 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'csharp';

export type RuleCategory = 'security' | 'debug' | 'console' | 'quality';

export type Severity = 'critical' | 'warning' | 'info';

/**
 * Represents a single code analysis rule
 */
export interface Rule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  languages: Language[];
  pattern: string;
  patternFlags?: string;
  message: string;
  remediation?: string;
  enabled: boolean;
  examples?: {
    bad: string;
    good: string;
  };
}

/**
 * Represents a single issue found in code
 */
export interface AnalysisResult {
  ruleId: string;
  ruleName: string;
  message: string;
  remediation?: string;
  severity: Severity;
  lineNumber: number;
  column?: number;
  code: string;
  category: RuleCategory;
}

/**
 * Analysis statistics
 */
export interface AnalysisStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  byCategory: Record<string, number>;
  byRuleId: Record<string, number>;
}

/**
 * Represents all analysis results for a file
 */
export interface FileAnalysisResults {
  filePath: string;
  language: Language;
  results: AnalysisResult[];
  stats?: AnalysisStats;
}

/**
 * Represents analysis results for an entire PR
 */
export interface PRAnalysisResults {
  prUrl: string;
  timestamp: number;
  files: FileAnalysisResults[];
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
}

/**
 * Message types for content script <-> service worker communication
 */
export type MessageType = 'analyze' | 'getSettings' | 'updateSettings' | 'getRules';

export interface ExtensionMessage {
  type: MessageType;
  payload?: Record<string, unknown>;
}

export interface AnalyzeMessage extends ExtensionMessage {
  type: 'analyze';
  payload: {
    code: string;
    language: Language;
    filePath: string;
  };
}

export interface GetSettingsMessage extends ExtensionMessage {
  type: 'getSettings';
}

export interface UpdateSettingsMessage extends ExtensionMessage {
  type: 'updateSettings';
  payload: {
    settings: Partial<ExtensionSettings>;
  };
}

export interface GetRulesMessage extends ExtensionMessage {
  type: 'getRules';
  payload?: {
    language?: Language;
  };
}

/**
 * User settings stored in Chrome storage
 */
export interface ExtensionSettings {
  enabledRuleIds: string[];
  customRules: Rule[];
  githubEnterpriseUrls: string[];
  debugMode: boolean;
}

/**
 * Represents a code line with metadata
 */
export interface CodeLine {
  lineNumber: number;
  content: string;
  isDiffAdded: boolean;
  isDiffRemoved: boolean;
}

/**
 * Represents extracted code from a file in the diff
 */
export interface ExtractedCode {
  filePath: string;
  language: Language;
  lines: CodeLine[];
}
