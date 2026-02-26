/**
 * JavaScript/TypeScript Performance Rules (3 rules)
 *
 * Detects common performance anti-patterns: async operations
 * misused in loops, expensive cloning, and blocking I/O.
 */

import type { Rule } from '../types.js';

export const jsPerformanceRules: Rule[] = [
  {
    id: 'JS-PERF-001',
    name: 'await Inside forEach',
    description: 'Using async/await inside .forEach() does not actually wait — the loop completes before any async operation resolves',
    category: 'performance',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\.forEach\\s*\\(\\s*async',
    patternFlags: 'gi',
    message: 'async function passed to .forEach() detected. forEach does not await async callbacks — use for...of or Promise.all() instead.',
    remediation:
      'Replace with: for (const item of items) { await doSomething(item); } for sequential execution, or await Promise.all(items.map(async (item) => doSomething(item))) for parallel execution.',
    enabled: true,
    examples: {
      bad: 'items.forEach(async (item) => { await saveItem(item); });',
      good: 'for (const item of items) { await saveItem(item); }\n// or parallel:\nawait Promise.all(items.map(item => saveItem(item)));',
    },
  },

  {
    id: 'JS-PERF-002',
    name: 'JSON Deep Clone',
    description: 'JSON.parse(JSON.stringify()) is a slow, lossy deep clone that drops functions, Dates, and undefined values',
    category: 'performance',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: 'JSON\\.parse\\s*\\(\\s*JSON\\.stringify\\s*\\(',
    patternFlags: 'gi',
    message: 'JSON.parse(JSON.stringify()) deep clone detected. This is slow and drops non-JSON-serialisable values (functions, Dates, undefined).',
    remediation:
      'Use structuredClone() (modern browsers/Node 17+) for deep cloning. For libraries: lodash cloneDeep. Avoid cloning entirely by designing immutable data flows.',
    enabled: true,
    examples: {
      bad: 'const copy = JSON.parse(JSON.stringify(originalObject));',
      good: 'const copy = structuredClone(originalObject);',
    },
  },

  {
    id: 'JS-PERF-003',
    name: 'Synchronous File System Operation',
    description: 'Synchronous fs operations block the Node.js event loop, causing performance degradation under load',
    category: 'performance',
    severity: 'warning',
    languages: ['javascript', 'typescript'],
    pattern: '\\bfs\\.(readFileSync|writeFileSync|appendFileSync|existsSync|mkdirSync|readdirSync|statSync|unlinkSync|copyFileSync)\\b',
    patternFlags: 'gi',
    message: 'Synchronous fs operation detected. This blocks the event loop during the operation.',
    remediation:
      'Use the async equivalent: fs.readFile() with await, or fs.promises.readFile(). Only use sync variants in top-level startup scripts where blocking is acceptable.',
    enabled: true,
    examples: {
      bad: 'const data = fs.readFileSync("config.json", "utf8");',
      good: 'const data = await fs.promises.readFile("config.json", "utf8");',
    },
  },
];

/**
 * Export function to get JavaScript performance rules
 */
export function getJavaScriptPerformanceRules(): Rule[] {
  return jsPerformanceRules;
}
