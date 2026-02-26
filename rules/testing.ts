/**
 * Testing Quality Rules (4 rules)
 *
 * Detects common test anti-patterns: skipped tests, commented-out
 * tests, empty test bodies, and focused test suites.
 */

import type { Rule } from '../types.js';

export const testingRules: Rule[] = [
  {
    id: 'JS-TEST-001',
    name: 'Skipped Test',
    description: 'Skipped tests hide broken or incomplete test coverage',
    category: 'testing',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\b(it|test|describe)\\.skip\\s*\\(|^\\s*x(it|describe)\\s*\\(|^\\s*xit\\s*\\(',
    patternFlags: 'gim',
    message: 'Skipped test detected (.skip / xit / xdescribe). Skipped tests hide missing coverage.',
    remediation:
      'Fix the skipped test so it passes, or delete it if it no longer applies. Never merge a PR with skipped tests unless tracked in an issue.',
    enabled: true,
    examples: {
      bad: 'it.skip("should validate email", () => { expect(validate("bad")).toBe(false); });',
      good: 'it("should validate email", () => { expect(validate("bad")).toBe(false); });',
    },
  },

  {
    id: 'JS-TEST-002',
    name: 'Focused Test (.only)',
    description: '.only() causes only that test to run in the suite, hiding failures elsewhere',
    category: 'testing',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\b(it|test|describe)\\.only\\s*\\(',
    patternFlags: 'gi',
    message: 'Focused test (.only) detected. This prevents other tests from running — likely a debugging leftover.',
    remediation:
      'Remove .only() before merging. All tests should run in CI. Use .only() only temporarily during local development.',
    enabled: true,
    examples: {
      bad: 'describe.only("UserService", () => { ... });',
      good: 'describe("UserService", () => { ... });',
    },
  },

  {
    id: 'JS-TEST-003',
    name: 'Commented-Out Test',
    description: 'Commented-out tests accumulate as dead code and hide gaps in coverage',
    category: 'testing',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '//\\s*(it|test|describe)\\s*\\(',
    patternFlags: 'gi',
    message: 'Commented-out test detected. Either restore it or delete it.',
    remediation:
      'Uncomment and fix the test if it still applies, or delete it entirely. Commented-out tests provide no coverage and clutter the file.',
    enabled: true,
    examples: {
      bad: '// it("should handle empty input", () => { ... })',
      good: 'it("should handle empty input", () => { expect(process("")).toBe(""); });',
    },
  },

  {
    id: 'JS-TEST-004',
    name: 'Empty Test Body',
    description: 'A test with an empty body always passes, providing false confidence in coverage',
    category: 'testing',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '(it|test)\\s*\\([^,]+,\\s*\\(\\s*\\)\\s*=>\\s*\\{\\s*\\}\\s*\\)',
    patternFlags: 'gi',
    message: 'Empty test body detected. This test always passes and provides no coverage.',
    remediation:
      'Add assertions to the test body. If the test is a placeholder, use it.todo() instead so it is visible as pending rather than silently passing.',
    enabled: true,
    examples: {
      bad: 'it("should create a user", () => {});',
      good: 'it("should create a user", async () => {\n  const user = await createUser({ name: "Alice" });\n  expect(user.id).toBeDefined();\n  expect(user.name).toBe("Alice");\n});',
    },
  },
];

/**
 * Export function to get testing quality rules
 */
export function getTestingRules(): Rule[] {
  return testingRules;
}
