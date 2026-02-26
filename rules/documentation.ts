/**
 * Documentation Quality Rules (3 rules)
 *
 * Detects incomplete or malformed JSDoc documentation that
 * signals missing API documentation coverage.
 */

import type { Rule } from '../types.js';

export const documentationRules: Rule[] = [
  {
    id: 'JS-DOC-001',
    name: 'Empty JSDoc Block',
    description: 'An empty JSDoc block provides no documentation value and is misleading',
    category: 'documentation',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '/\\*\\*\\s*\\*/',
    patternFlags: 'g',
    message: 'Empty JSDoc block detected. Add a description or remove the comment block.',
    remediation:
      'Fill in the JSDoc with at least a one-sentence description of what the function/class does. Include @param and @returns tags for public APIs.',
    enabled: true,
    examples: {
      bad: '/** */\nfunction processOrder(order) { }',
      good: '/**\n * Processes an order and returns the confirmation ID.\n * @param order - The order to process\n * @returns The confirmation ID\n */\nfunction processOrder(order) { }',
    },
  },

  {
    id: 'JS-DOC-002',
    name: '@param Without Type Annotation',
    description: 'A @param tag without a type annotation provides incomplete documentation',
    category: 'documentation',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '@param\\s+(?!\\{)\\w',
    patternFlags: 'gi',
    message: '@param tag missing type annotation. Add {Type} before the parameter name.',
    remediation:
      'Use the format: @param {Type} paramName - Description. For TypeScript, this is less critical as types are in the signature, but it improves IDE hover documentation.',
    enabled: true,
    examples: {
      bad: '* @param userId - The user\'s ID',
      good: '* @param {string} userId - The user\'s ID',
    },
  },

  {
    id: 'JS-DOC-003',
    name: '@returns Without Description',
    description: 'A @returns tag with no description does not explain what is returned or when',
    category: 'documentation',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '@returns?\\s*$',
    patternFlags: 'gim',
    message: '@returns tag has no description. Explain what is returned and any relevant conditions.',
    remediation:
      'Add a description: @returns {Type} Description of the returned value. Note any special cases like when null or undefined may be returned.',
    enabled: true,
    examples: {
      bad: '* @returns',
      good: '* @returns {User | null} The user object, or null if not found.',
    },
  },
];

/**
 * Export function to get documentation quality rules
 */
export function getDocumentationRules(): Rule[] {
  return documentationRules;
}
