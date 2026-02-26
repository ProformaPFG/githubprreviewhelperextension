/**
 * JavaScript/TypeScript Code Quality Rules (7 rules)
 *
 * Common code quality issues and anti-patterns in JS/TS that cause
 * bugs or indicate incomplete/problematic work.
 */

import type { Rule } from '../types.js';

export const jsQualityRules: Rule[] = [
  {
    id: 'JS-QUAL-001',
    name: 'TODO Comment',
    description: 'TODO comments indicate incomplete work that should be tracked',
    category: 'quality',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '//\\s*TODO\\s*[:\\s]',
    patternFlags: 'gi',
    message: 'TODO comment detected. Track the work in an issue or remove the comment.',
    remediation:
      'Create a GitHub issue or ticket for the TODO item. Reference it in the comment (// TODO: see #123).',
    enabled: true,
    examples: {
      bad: '// TODO: fix this later\nreturn null;',
      good: '// See issue #123 for fix\nreturn null;',
    },
  },

  {
    id: 'JS-QUAL-002',
    name: 'FIXME Comment',
    description: 'FIXME comments indicate code that is known to be broken',
    category: 'quality',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '//\\s*FIXME\\s*[:\\s]',
    patternFlags: 'gi',
    message: 'FIXME comment detected. This code is known to have a problem — fix or track it.',
    remediation:
      'Fix the identified issue or create a tracking ticket and reference it in the comment.',
    enabled: true,
    examples: {
      bad: '// FIXME: memory leak here\nthis.cache = {};',
      good: '// Fixed memory leak — see PR #456\nthis.cache = new WeakMap();',
    },
  },

  {
    id: 'JS-QUAL-003',
    name: 'HACK Comment',
    description: 'HACK comments indicate shortcuts that may need revisiting',
    category: 'quality',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '//\\s*HACK\\s*[:\\s]',
    patternFlags: 'gi',
    message: 'HACK comment detected. This indicates a shortcut that may cause problems.',
    remediation:
      'Refactor the code properly or create an issue to track the improvement. Document why the hack was necessary.',
    enabled: true,
    examples: {
      bad: '// HACK: quick fix before demo\nreturn items.slice(0, 10);',
      good: '// Temporary limit — pagination tracked in issue #789\nreturn items.slice(0, 10);',
    },
  },

  {
    id: 'JS-QUAL-004',
    name: 'Loose Equality (==)',
    description: 'Loose equality performs type coercion and can produce unexpected results',
    category: 'quality',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '(?<![=!<>])==(?!=)',
    patternFlags: 'g',
    message: 'Loose equality (==) detected. Use strict equality (===) to avoid unintended type coercion.',
    remediation:
      'Replace == with ===. Exception: "x == null" is a common idiom to check both null and undefined in one expression.',
    enabled: true,
    examples: {
      bad: 'if (value == 0) { /* also matches "", false, null */ }',
      good: 'if (value === 0) { /* only matches number 0 */ }',
    },
  },

  {
    id: 'JS-QUAL-005',
    name: 'for...in Loop',
    description: 'for...in iterates over enumerable properties including inherited ones',
    category: 'quality',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: 'for\\s*\\(\\s*(?:const|let|var)?\\s*\\w+\\s+in\\s+\\w+',
    patternFlags: 'gi',
    message: 'for...in loop detected. Ensure this is intentional — for...in includes inherited properties and should not be used for arrays.',
    remediation:
      'Use for...of for arrays, Object.keys()/Object.entries() for plain objects. Add hasOwnProperty check if using for...in.',
    enabled: true,
    examples: {
      bad: 'for (const key in myArray) { console.log(myArray[key]); }',
      good: 'for (const item of myArray) { console.log(item); }\n// Or for objects:\nfor (const [key, value] of Object.entries(myObj)) { }',
    },
  },

  {
    id: 'JS-QUAL-006',
    name: 'Rethrow Without Preserving Error',
    description: '"throw err" in a catch block loses the original stack context',
    category: 'quality',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: 'catch\\s*\\(\\s*(\\w+)\\s*\\)\\s*\\{[^}]*\\bthrow\\s+\\1\\s*;',
    patternFlags: 'gi',
    message: 'Rethrowing the caught error directly. Consider using "throw new Error(msg, { cause: err })" to preserve context.',
    remediation:
      'In JavaScript, use "throw new Error(message, { cause: originalError })" or just "throw err" directly. Avoid wrapping without cause.',
    enabled: true,
    examples: {
      bad: 'catch (err) { console.error(err); throw err; }',
      good: 'catch (err) { throw new Error("Failed to load user", { cause: err }); }',
    },
  },

  {
    id: 'JS-QUAL-007',
    name: 'var Declaration',
    description: 'var has function scope and hoisting behavior that causes subtle bugs',
    category: 'quality',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\bvar\\s+\\w+',
    patternFlags: 'gi',
    message: 'var declaration detected. Use const or let instead to avoid hoisting surprises and unintended re-declaration.',
    remediation:
      'Replace var with const if the binding is never reassigned, or let if it is. This prevents accidental hoisting and re-declaration.',
    enabled: true,
    examples: {
      bad: 'var count = 0;\nfor (var i = 0; i < items.length; i++) { }',
      good: 'const count = 0;\nfor (let i = 0; i < items.length; i++) { }',
    },
  },
];

/**
 * Export function to get JavaScript/TypeScript quality rules
 */
export function getJavaScriptQualityRules(): Rule[] {
  return jsQualityRules;
}
