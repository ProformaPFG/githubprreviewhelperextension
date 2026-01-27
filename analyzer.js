/**
 * Analysis Engine - Core pattern matching and rule execution
 * 
 * Responsible for:
 * - Loading and executing rules against code
 * - Pattern matching with regex
 * - Line number calculation
 * - Result deduplication and aggregation
 */

import type { Rule, Language, AnalysisResult, FileAnalysisResults } from './types';

/**
 * Calculate the line number where a match occurred
 * @param code Full code string
 * @param matchPosition Position of match in string (from regex)
 * @returns Line number (1-indexed)
 */
export function calculateLineNumber(code: string, matchPosition: number): number {
  // Count newlines up to match position
  const lineCount = code.substring(0, matchPosition).split('\n').length;
  return lineCount;
}

/**
 * Extract the matched text from code
 * @param code Full code string
 * @param match RegExp match result
 * @returns The matched text
 */
export function extractMatchedText(code: string, match: RegExpExecArray): string {
  return match[0];
}

/**
 * Get column position of match (position on the line)
 * @param code Full code string
 * @param matchPosition Position in string
 * @returns Column number (0-indexed)
 */
export function getColumnNumber(code: string, matchPosition: number): number {
  const lastNewline = code.lastIndexOf('\n', matchPosition);
  const column = matchPosition - (lastNewline + 1);
  return column;
}

/**
 * Execute a single rule against code
 * @param code Code to analyze
 * @param rule Rule to execute
 * @param filePath Path of the file being analyzed
 * @returns Array of analysis results
 */
export function executeRule(
  code: string,
  rule: Rule,
  filePath: string
): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  
  if (!rule.enabled) {
    return results;
  }
  
  try {
    // Build regex from pattern and flags
    const flags = rule.patternFlags || 'gi';
    const regex = new RegExp(rule.pattern, flags);
    
    let match: RegExpExecArray | null;
    
    // Execute pattern matching
    while ((match = regex.exec(code)) !== null) {
      const lineNumber = calculateLineNumber(code, match.index);
      const column = getColumnNumber(code, match.index);
      const matchedText = extractMatchedText(code, match);
      
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        message: rule.message,
        remediation: rule.remediation,
        severity: rule.severity,
        lineNumber,
        column,
        code: matchedText,
        category: rule.category,
      });
    }
  } catch (error) {
    console.error(`Error executing rule ${rule.id}:`, error);
    // Don't throw - continue with other rules
  }
  
  return results;
}

/**
 * Deduplicate results by ruleId and line number
 * Keeps the first occurrence of each duplicate
 */
export function deduplicateResults(results: AnalysisResult[]): AnalysisResult[] {
  const seen = new Set<string>();
  const deduplicated: AnalysisResult[] = [];
  
  for (const result of results) {
    // Create unique key from ruleId and lineNumber
    const key = `${result.ruleId}:${result.lineNumber}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }
  
  return deduplicated;
}

/**
 * Sort results by severity and line number
 * Severity order: critical > warning > info
 */
export function sortResults(results: AnalysisResult[]): AnalysisResult[] {
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  
  return results.sort((a, b) => {
    // First by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // Then by line number
    return a.lineNumber - b.lineNumber;
  });
}

/**
 * Analyze code against a set of rules
 * @param code Code to analyze
 * @param language Language type for filtering rules
 * @param rules Array of rules to check
 * @param filePath Path of file being analyzed (for results)
 * @returns File analysis results
 */
export function analyzeCode(
  code: string,
  language: Language,
  rules: Rule[],
  filePath: string = ''
): FileAnalysisResults {
  // Filter rules that apply to this language
  const applicableRules = rules.filter(rule => rule.languages.includes(language));
  
  // Execute all rules
  let allResults: AnalysisResult[] = [];
  for (const rule of applicableRules) {
    const ruleResults = executeRule(code, rule, filePath);
    allResults = allResults.concat(ruleResults);
  }
  
  // Deduplicate and sort results
  const deduplicated = deduplicateResults(allResults);
  const sorted = sortResults(deduplicated);
  
  return {
    filePath,
    language,
    results: sorted,
  };
}

/**
 * Analyze multiple files
 * @param files Array of files with code and language
 * @param rules Array of rules to apply
 * @returns Summary of all analysis results
 */
export interface FileToAnalyze {
  filePath: string;
  language: Language;
  code: string;
}

export function analyzeFiles(
  files: FileToAnalyze[],
  rules: Rule[]
): FileAnalysisResults[] {
  return files.map(file =>
    analyzeCode(file.code, file.language, rules, file.filePath)
  );
}

/**
 * Get statistics about analysis results
 */
export interface AnalysisStats {
  totalFiles: number;
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  affectedFiles: number;
  byCategory: Record<string, number>;
}

export function getAnalysisStats(results: FileAnalysisResults[]): AnalysisStats {
  const stats: AnalysisStats = {
    totalFiles: results.length,
    totalIssues: 0,
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    affectedFiles: 0,
    byCategory: {},
  };
  
  const filesWithIssues = new Set<string>();
  
  for (const fileResult of results) {
    for (const issue of fileResult.results) {
      stats.totalIssues++;
      filesWithIssues.add(fileResult.filePath);
      
      switch (issue.severity) {
        case 'critical':
          stats.criticalCount++;
          break;
        case 'warning':
          stats.warningCount++;
          break;
        case 'info':
          stats.infoCount++;
          break;
      }
      
      // Count by category
      stats.byCategory[issue.category] = (stats.byCategory[issue.category] || 0) + 1;
    }
  }
  
  stats.affectedFiles = filesWithIssues.size;
  
  return stats;
}

/**
 * Filter results by severity level
 * Returns issues at or above the specified severity
 */
export function filterBySeverity(
  results: AnalysisResult[],
  minSeverity: 'info' | 'warning' | 'critical'
): AnalysisResult[] {
  const severityOrder = { info: 2, warning: 1, critical: 0 };
  const minLevel = severityOrder[minSeverity];
  
  return results.filter(result => severityOrder[result.severity] <= minLevel);
}

/**
 * Filter results by category
 */
export function filterByCategory(
  results: AnalysisResult[],
  category: string
): AnalysisResult[] {
  return results.filter(result => result.category === category);
}

/**
 * Filter results by rule ID
 */
export function filterByRuleId(
  results: AnalysisResult[],
  ruleId: string
): AnalysisResult[] {
  return results.filter(result => result.ruleId === ruleId);
}
