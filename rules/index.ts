/**
 * Rules Index - Central export point for all rules
 * 
 * Exports all available rules organized by language and category
 */

import type { Rule, Language } from '../types.js';
import { getHTMLSecurityRules } from './html-security.js';
import { getHTMLSecurityExtendedRules } from './html-security-extended.js';
import { getCSSSecurityRules } from './css-security.js';
import { getJavaScriptSecurityRules } from './javascript-security.js';
import { getJavaScriptSecurityExtendedRules } from './javascript-security-extended.js';
import { getJavaScriptDebugRules } from './javascript-debug.js';
import { getJavaScriptDebugExtendedRules } from './javascript-debug-extended.js';
import { getCSharpSecurityRules } from './csharp-security.js';
import { getCSharpDebugRules } from './csharp-debug.js';

/**
 * Get all available rules
 */
export function getAllRules(): Rule[] {
  return [
    ...getHTMLSecurityRules(),
    ...getHTMLSecurityExtendedRules(),
    ...getCSSSecurityRules(),
    ...getJavaScriptSecurityRules(),
    ...getJavaScriptSecurityExtendedRules(),
    ...getJavaScriptDebugRules(),
    ...getJavaScriptDebugExtendedRules(),
    ...getCSharpSecurityRules(),
    ...getCSharpDebugRules(),
  ];
}

/**
 * Get rules for a specific language
 */
export function getRulesForLanguage(language: Language): Rule[] {
  return getAllRules().filter(rule => rule.languages.includes(language));
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category: string): Rule[] {
  return getAllRules().filter(rule => rule.category === category);
}

/**
 * Get rules by severity
 */
export function getRulesBySeverity(severity: string): Rule[] {
  return getAllRules().filter(rule => rule.severity === severity);
}

/**
 * Get a specific rule by ID
 */
export function getRuleById(ruleId: string): Rule | undefined {
  return getAllRules().find(rule => rule.id === ruleId);
}

/**
 * Get enabled rules (by default, all are enabled)
 */
export function getEnabledRules(): Rule[] {
  return getAllRules().filter(rule => rule.enabled);
}

/**
 * Rule summary statistics
 */
export interface RuleSummary {
  total: number;
  byLanguage: Record<Language, number>;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byRuleId: Record<string, Rule>;
}

/**
 * Get summary statistics of all rules
 */
export function getRulesSummary(): RuleSummary {
  const allRules = getAllRules();
  
  const summary: RuleSummary = {
    total: allRules.length,
    byLanguage: {
      html: 0,
      css: 0,
      javascript: 0,
      typescript: 0,
      jsx: 0,
      tsx: 0,
      csharp: 0,
    },
    byCategory: {},
    bySeverity: {},
    byRuleId: {},
  };
  
  for (const rule of allRules) {
    // By rule ID (for quick lookup)
    summary.byRuleId[rule.id] = rule;
    
    // By category
    summary.byCategory[rule.category] = (summary.byCategory[rule.category] || 0) + 1;
    
    // By severity
    summary.bySeverity[rule.severity] = (summary.bySeverity[rule.severity] || 0) + 1;
    
    // By language
    for (const lang of rule.languages) {
      summary.byLanguage[lang as Language]++;
    }
  }
  
  return summary;
}

/**
 * Log a summary of all available rules
 */
export function logRulesSummary(): void {
  const summary = getRulesSummary();
  
  console.log('📋 GitHub Code Review Assistant - Rules Summary');
  console.log('================================================');
  console.log(`Total Rules: ${summary.total}`);
  console.log('');
  console.log('By Category:');
  Object.entries(summary.byCategory).forEach(([category, count]) => {
    console.log(`  • ${category}: ${count}`);
  });
  console.log('');
  console.log('By Severity:');
  Object.entries(summary.bySeverity).forEach(([severity, count]) => {
    console.log(`  • ${severity}: ${count}`);
  });
  console.log('');
  console.log('By Language (cross-platform):');
  Object.entries(summary.byLanguage).forEach(([lang, count]) => {
    if (count > 0) {
      console.log(`  • ${lang}: ${count}`);
    }
  });
}
