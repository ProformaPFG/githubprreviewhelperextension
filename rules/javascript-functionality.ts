/**
 * JavaScript/TypeScript Functionality Rules (3 rules)
 *
 * Detects error-handling anti-patterns that indicate missing
 * functionality coverage — empty catches, swallowed errors,
 * and unhandled promise rejections.
 */

import type { Rule } from '../types.js';

export const jsFunctionalityRules: Rule[] = [
  {
    id: 'JS-FUNC-001',
    name: 'Empty Catch Block',
    description: 'An empty catch block silently swallows exceptions, hiding errors',
    category: 'functionality',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: 'catch\\s*\\(\\s*\\w+\\s*\\)\\s*\\{\\s*\\}',
    patternFlags: 'gi',
    message: 'Empty catch block detected. Errors are being silently swallowed.',
    remediation:
      'At minimum, log the error. Better: handle it, re-throw it, or use the error to update application state. Never silently ignore exceptions.',
    enabled: true,
    examples: {
      bad: 'try { await saveUser(data); } catch (err) {}',
      good: 'try { await saveUser(data); } catch (err) { logger.error("Failed to save user", err); throw err; }',
    },
  },

  {
    id: 'JS-FUNC-002',
    name: 'Error Logged But Not Handled',
    description: 'Catch blocks that only log errors without re-throwing or recovering hide failures from callers',
    category: 'functionality',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: 'catch\\s*\\([^)]+\\)\\s*\\{\\s*console\\.(log|warn|error|debug)\\(',
    patternFlags: 'gi',
    message: 'Catch block appears to only log the error. Verify the error is also re-thrown or handled — callers may not know the operation failed.',
    remediation:
      'After logging, either re-throw the error, throw a domain-specific error with context, or explicitly handle the failure state. Logging alone hides errors from callers.',
    enabled: true,
    examples: {
      bad: 'catch (err) { console.error(err); }',
      good: 'catch (err) { console.error("Failed to load config", err); throw new Error("Config unavailable", { cause: err }); }',
    },
  },

  {
    id: 'JS-FUNC-003',
    name: 'Empty Promise Catch Handler',
    description: 'An empty .catch() handler swallows promise rejections',
    category: 'functionality',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\.catch\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*\\{\\s*\\}\\s*\\)',
    patternFlags: 'gi',
    message: 'Empty .catch() handler detected. Promise rejections are being silently swallowed.',
    remediation:
      'Add error handling inside the .catch() — log the error, show user feedback, or re-throw. Never use an empty catch handler.',
    enabled: true,
    examples: {
      bad: 'fetchData().then(render).catch(() => {})',
      good: 'fetchData().then(render).catch((err) => { showErrorToast("Failed to load"); logger.error(err); })',
    },
  },
];

/**
 * Export function to get JavaScript functionality rules
 */
export function getJavaScriptFunctionalityRules(): Rule[] {
  return jsFunctionalityRules;
}
