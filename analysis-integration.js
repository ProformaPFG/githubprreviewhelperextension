/**
 * Analysis Integration - Connects analyzer with settings and rules
 * 
 * This module coordinates:
 * - Loading rules
 * - Respecting user settings (enabled/disabled rules)
 * - Running analysis
 * - Formatting results
 */

import { analyze as analyzeCode } from './analyzer';
import { getAllRules } from './rules';
import { settingsManager, type ExtensionSettings } from './settings-manager';
import type { FileAnalysisResults } from './types';

/**
 * Run analysis with settings applied
 */
export async function analyzeWithSettings(
  code: string,
  language: string,
  filePath: string = 'unknown'
): Promise<FileAnalysisResults> {
  try {
    // Initialize settings if needed
    const settings = await settingsManager.getAll();

    // Load all rules
    const allRules = getAllRules();

    // Filter rules based on settings
    const enabledRules = await filterRulesBySettings(allRules, settings);

    // Run analysis
    const results = analyzeCode(code, language, enabledRules, filePath);

    return results;
  } catch (error) {
    console.error('❌ Analysis failed:', error);

    // Return empty results on failure instead of crashing
    return {
      filePath,
      language,
      results: [],
      stats: {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        byCategory: {},
        byRuleId: {},
      },
    };
  }
}

/**
 * Filter rules based on user settings
 */
async function filterRulesBySettings(
  allRules: any[],
  settings: ExtensionSettings
): Promise<any[]> {
  const filtered = [];

  for (const rule of allRules) {
    // Check if security rules are enabled
    if (rule.category === 'security' && !settings.enableSecurityRules) {
      continue;
    }

    // Check if debug rules are enabled
    if (rule.category === 'debug' && !settings.enableDebugRules) {
      continue;
    }

    // Check if specific rule is enabled
    if (settings.enabledRuleIds.length > 0) {
      // If user has specified rules, only include those
      if (!settings.enabledRuleIds.includes(rule.id)) {
        continue;
      }
    }

    // Rule passed all filters
    filtered.push(rule);
  }

  // Include custom rules
  if (settings.customRules && settings.customRules.length > 0) {
    filtered.push(...settings.customRules);
  }

  return filtered;
}

/**
 * Get analysis stats for display
 */
export function getAnalysisStats(results: FileAnalysisResults) {
  return {
    total: results.stats.total,
    critical: results.stats.critical,
    warning: results.stats.warning,
    info: results.stats.info,
    byCategory: results.stats.byCategory,
    enabledRules: results.stats.byRuleId,
  };
}

/**
 * Format results for export
 */
export function formatResultsForExport(results: FileAnalysisResults[]): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push('# Code Review Analysis Report\n');
  lines.push(`**Generated:** ${timestamp}\n`);

  // Summary
  let totalIssues = 0;
  let criticalCount = 0;
  let warningCount = 0;

  for (const file of results) {
    totalIssues += file.results.length;
    for (const result of file.results) {
      if (result.severity === 'critical') criticalCount++;
      if (result.severity === 'warning') warningCount++;
    }
  }

  lines.push(`**Total Issues:** ${totalIssues}\n`);
  lines.push(`- 🔴 Critical: ${criticalCount}\n`);
  lines.push(`- ⚠️ Warning: ${warningCount}\n\n`);

  // Issues by file
  lines.push('## Issues by File\n');

  for (const file of results) {
    if (file.results.length === 0) continue;

    lines.push(`### ${file.filePath}\n`);

    for (const issue of file.results) {
      const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      lines.push(`${icon} **Line ${issue.lineNumber}**: ${issue.ruleName} (${issue.ruleId})\n`);
      lines.push(`   ${issue.message}\n`);
      if (issue.remediation) {
        lines.push(`   *Fix: ${issue.remediation}*\n`);
      }
      lines.push('\n');
    }
  }

  return lines.join('');
}
