/**
 * JavaScript Debug Rules (5 rules)
 * 
 * Rules for detecting debug statements left in production code
 */

import type { Rule } from '../types';

export const jsDebugRules: Rule[] = [
  {
    id: 'JS-DBG-001',
    name: 'Debugger Statement',
    description: 'debugger statements should be removed before production',
    category: 'debug',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bdebugger\\s*[;:]?',
    patternFlags: 'gi',
    message: 'debugger statement detected. Remove before production.',
    remediation:
      'Remove all debugger statements. Use proper debugging tools and breakpoints instead. DevTools can pause execution without hardcoding.',
    enabled: true,
    examples: {
      bad: 'if (error) {\n  debugger;\n  console.log(error);\n}',
      good: 'if (error) {\n  console.log(error);\n  // Add breakpoint in DevTools instead\n}',
    },
  },

  {
    id: 'JS-DBG-002',
    name: 'console.log Statement',
    description: 'console.log statements should typically be removed before production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\s*\\.\\s*log\\s*\\(',
    patternFlags: 'gi',
    message: 'console.log statement detected. Consider removing or using a proper logging framework.',
    remediation:
      'Replace debug console.log calls with a proper logging framework (e.g., winston, pino). Use environment-based log levels to control verbosity.',
    enabled: true,
    examples: {
      bad: 'const data = fetchData();\nconsole.log("Data:", data);',
      good: 'const data = fetchData();\nlogger.debug("Data retrieved", { data });',
    },
  },

  {
    id: 'JS-DBG-013',
    name: 'alert() Statement',
    description: 'alert() statements block user interaction and should be avoided',
    category: 'debug',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\balert\\s*\\(',
    patternFlags: 'gi',
    message: 'alert() statement detected. Use proper UI components or notifications instead.',
    remediation:
      'Replace alert() with proper UI components like modals, toast notifications, or snackbars. These provide better UX and don\'t block execution.',
    enabled: true,
    examples: {
      bad: 'if (error) alert("An error occurred!");',
      good: 'if (error) showNotification("An error occurred!", "error");',
    },
  },

  {
    id: 'JS-DBG-014',
    name: 'confirm() Statement',
    description: 'confirm() should be replaced with proper UI confirmation dialogs',
    category: 'debug',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconfirm\\s*\\(',
    patternFlags: 'gi',
    message: 'confirm() statement detected. Use a proper confirmation dialog instead.',
    remediation:
      'Replace confirm() with a proper modal dialog. This provides consistent UI and better UX across different platforms and devices.',
    enabled: true,
    examples: {
      bad: 'const agreed = confirm("Are you sure?");',
      good: 'const agreed = await showConfirmDialog("Are you sure?");',
    },
  },

  {
    id: 'JS-DBG-015',
    name: 'prompt() Statement',
    description: 'prompt() should be replaced with proper input components',
    category: 'debug',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bprompt\\s*\\(',
    patternFlags: 'gi',
    message: 'prompt() statement detected. Use a proper input dialog instead.',
    remediation:
      'Replace prompt() with a proper modal dialog or form. This provides better UX, input validation, and a consistent interface.',
    enabled: true,
    examples: {
      bad: 'const name = prompt("Enter your name:");',
      good: 'const name = await showInputDialog("Enter your name:");',
    },
  },
];

/**
 * Export function to get JavaScript debug rules
 */
export function getJavaScriptDebugRules(): Rule[] {
  return jsDebugRules;
}
