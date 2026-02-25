/**
 * TypeScript-Specific Quality Rules (4 rules)
 *
 * Rules for TypeScript anti-patterns that undermine type safety.
 * These only apply to .ts and .tsx files.
 */

import type { Rule } from '../types.js';

export const tsQualityRules: Rule[] = [
  {
    id: 'TS-QUAL-001',
    name: '@ts-ignore Suppression',
    description: '@ts-ignore silently suppresses TypeScript errors without explanation',
    category: 'quality',
    severity: 'warning',
    languages: ['typescript', 'tsx', 'svelte'],
    pattern: '//\\s*@ts-ignore',
    patternFlags: 'gi',
    message: '@ts-ignore detected. This suppresses a type error without explaining why. Use @ts-expect-error with a comment instead.',
    remediation:
      'Replace with // @ts-expect-error followed by a comment explaining why. Better: fix the underlying type issue. @ts-expect-error at least fails if the error disappears.',
    enabled: true,
    examples: {
      bad: '// @ts-ignore\nconst result = legacyFn(value);',
      good: '// @ts-expect-error — legacyFn types are wrong, tracked in #123\nconst result = legacyFn(value);',
    },
  },

  {
    id: 'TS-QUAL-002',
    name: '@ts-nocheck Directive',
    description: '@ts-nocheck disables all type checking for the entire file',
    category: 'quality',
    severity: 'warning',
    languages: ['typescript', 'tsx', 'svelte'],
    pattern: '//\\s*@ts-nocheck',
    patternFlags: 'gi',
    message: '@ts-nocheck detected. This disables TypeScript for the entire file, defeating its purpose.',
    remediation:
      'Remove @ts-nocheck and fix the type errors. If migrating a file, address individual errors with @ts-expect-error and a comment.',
    enabled: true,
    examples: {
      bad: '// @ts-nocheck\n// entire file has no type checking',
      good: '// Fix type errors individually rather than disabling the whole file',
    },
  },

  {
    id: 'TS-QUAL-003',
    name: 'Type Assertion to any',
    description: '"as any" bypasses the type system entirely',
    category: 'quality',
    severity: 'info',
    languages: ['typescript', 'tsx', 'svelte'],
    pattern: '\\bas\\s+any\\b',
    patternFlags: 'gi',
    message: '"as any" detected. This disables type checking for this expression.',
    remediation:
      'Use a more specific type assertion or fix the type definition. Use "unknown" as an intermediate type if needed instead of "any".',
    enabled: true,
    examples: {
      bad: 'const user = (response.data as any).user;',
      good: 'const user = (response.data as ApiResponse).user;',
    },
  },

  {
    id: 'TS-QUAL-004',
    name: 'Non-null Assertion on Property Access',
    description: 'The ! non-null assertion operator can mask null/undefined errors at runtime',
    category: 'quality',
    severity: 'info',
    languages: ['typescript', 'tsx', 'svelte'],
    pattern: '\\w+!\\.\\w+',
    patternFlags: 'g',
    message: 'Non-null assertion (!) before property access detected. This will throw if the value is null/undefined.',
    remediation:
      'Use optional chaining (?.) with a nullish coalescing default, or add a null check. Only use ! when you are certain the value cannot be null/undefined.',
    enabled: true,
    examples: {
      bad: 'const name = user!.profile!.name;',
      good: 'const name = user?.profile?.name ?? "Unknown";',
    },
  },
];

/**
 * Export function to get TypeScript quality rules
 */
export function getTypeScriptQualityRules(): Rule[] {
  return tsQualityRules;
}
