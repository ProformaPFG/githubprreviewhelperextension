/**
 * Extended JavaScript Debug Rules (10 additional rules)
 * 
 * Rules JS-DBG-003 through JS-DBG-012
 * Various console methods that should typically be removed from production
 */

import type { Rule } from '../types.js';

export const jsDebugExtendedRules: Rule[] = [
  {
    id: 'JS-DBG-003',
    name: 'console.warn Statement',
    description: 'console.warn statements should typically be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.warn\\s*\\(',
    patternFlags: 'gi',
    message: 'console.warn statement detected. Consider removing or using a logging framework.',
    remediation:
      'Replace debug console.warn calls with a proper logging framework. Use environment-based log levels to control output verbosity.',
    enabled: true,
    examples: {
      bad: 'console.warn("This is a warning");',
      good: 'logger.warn("This is a warning");',
    },
  },

  {
    id: 'JS-DBG-004',
    name: 'console.error Statement',
    description: 'console.error statements should typically be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.error\\s*\\(',
    patternFlags: 'gi',
    message: 'console.error statement detected. Consider using a proper error handling/logging framework.',
    remediation:
      'Replace console.error with a proper error tracking service (e.g., Sentry, Rollbar) for production environments.',
    enabled: true,
    examples: {
      bad: 'console.error("Error:", error);',
      good: 'errorTracker.captureException(error);',
    },
  },

  {
    id: 'JS-DBG-005',
    name: 'console.debug Statement',
    description: 'console.debug statements should typically be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.debug\\s*\\(',
    patternFlags: 'gi',
    message: 'console.debug statement detected. Consider removing or using a logging framework.',
    remediation:
      'Replace debug console.debug calls with a proper logging framework at appropriate debug level.',
    enabled: true,
    examples: {
      bad: 'console.debug("Debug info:", value);',
      good: 'logger.debug("Debug info:", value);',
    },
  },

  {
    id: 'JS-DBG-006',
    name: 'console.info Statement',
    description: 'console.info statements should typically be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.info\\s*\\(',
    patternFlags: 'gi',
    message: 'console.info statement detected. Consider removing or using a logging framework.',
    remediation:
      'Replace console.info with a proper logging framework if this is important information that should be tracked.',
    enabled: true,
    examples: {
      bad: 'console.info("User logged in");',
      good: 'logger.info("User logged in");',
    },
  },

  {
    id: 'JS-DBG-007',
    name: 'console.table Statement',
    description: 'console.table is a debugging tool that should be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.table\\s*\\(',
    patternFlags: 'gi',
    message: 'console.table statement detected. This is a debugging tool that should be removed.',
    remediation:
      'Remove console.table statements before production deployment. Use proper logging if data needs to be tracked.',
    enabled: true,
    examples: {
      bad: 'console.table(users);',
      good: '// Use logger.debug or remove entirely',
    },
  },

  {
    id: 'JS-DBG-008',
    name: 'console.trace Statement',
    description: 'console.trace outputs stack traces that should be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.trace\\s*\\(',
    patternFlags: 'gi',
    message: 'console.trace statement detected. Stack traces should not be logged to console in production.',
    remediation:
      'Remove console.trace or use error tracking service to capture stack traces securely.',
    enabled: true,
    examples: {
      bad: 'console.trace("Trace point");',
      good: 'errorTracker.captureMessage("Trace point");',
    },
  },

  {
    id: 'JS-DBG-009',
    name: 'console.dir Statement',
    description: 'console.dir is a debugging tool for object inspection that should be removed',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.dir\\s*\\(',
    patternFlags: 'gi',
    message: 'console.dir statement detected. This is a debugging tool for object inspection.',
    remediation:
      'Remove console.dir from production code. Use proper logging if object properties need to be tracked.',
    enabled: true,
    examples: {
      bad: 'console.dir(element);',
      good: '// Remove or use logger.debug(element)',
    },
  },

  {
    id: 'JS-DBG-010',
    name: 'console.time Statement',
    description: 'console.time is for performance debugging and should be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.time\\s*\\(',
    patternFlags: 'gi',
    message: 'console.time statement detected. This is a performance debugging tool.',
    remediation:
      'Remove console.time/timeEnd or use proper performance monitoring APIs (Performance.measure) for production.',
    enabled: true,
    examples: {
      bad: 'console.time("operation");\n// code\nconsole.timeEnd("operation");',
      good: 'performance.mark("start");\n// code\nperformance.mark("end");\nperformance.measure("operation", "start", "end");',
    },
  },

  {
    id: 'JS-DBG-011',
    name: 'console.group Statement',
    description: 'console.group is for organizing console output and should be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.group\\s*\\(',
    patternFlags: 'gi',
    message: 'console.group statement detected. This is a debugging/organization tool.',
    remediation:
      'Remove console.group statements from production code.',
    enabled: true,
    examples: {
      bad: 'console.group("Request Details");\nconsole.log(data);\nconsole.groupEnd();',
      good: '// Use logger.debug instead',
    },
  },

  {
    id: 'JS-DBG-012',
    name: 'console.assert Statement',
    description: 'console.assert is for debugging and should be removed from production',
    category: 'debug',
    severity: 'info',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bconsole\\.assert\\s*\\(',
    patternFlags: 'gi',
    message: 'console.assert statement detected. This is a debugging assertion tool.',
    remediation:
      'Remove console.assert or use proper unit tests and assertions in your test suite instead.',
    enabled: true,
    examples: {
      bad: 'console.assert(value > 0, "Value must be positive");',
      good: '// Use unit tests with proper assertions',
    },
  },
];

/**
 * Export function to get extended JavaScript debug rules
 */
export function getJavaScriptDebugExtendedRules(): Rule[] {
  return jsDebugExtendedRules;
}
