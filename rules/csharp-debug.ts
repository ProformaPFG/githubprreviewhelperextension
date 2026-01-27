/**
 * C# Debug Rules (12 rules)
 * 
 * Debugging statements and markers that should be removed from production
 */

import type { Rule } from '../types';

export const csharpDebugRules: Rule[] = [
  {
    id: 'CS-DBG-001',
    name: 'Debug WriteLine',
    description: 'Debug.WriteLine statements should be removed from production',
    category: 'debug',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'Debug\\.WriteLine\\s*\\(',
    patternFlags: 'gi',
    message: 'Debug.WriteLine statement detected. Remove or use a logging framework.',
    remediation:
      'Replace with proper logging framework (e.g., Serilog, NLog, log4net). Use conditional compilation #if DEBUG for debug-only statements.',
    enabled: true,
    examples: {
      bad: 'Debug.WriteLine("Debug: " + value);',
      good: 'logger.Debug("Debug: {value}", value);',
    },
  },

  {
    id: 'CS-DBG-002',
    name: 'Debug Print',
    description: 'Debug.Print statements should be removed from production',
    category: 'debug',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'Debug\\.Print\\s*\\(',
    patternFlags: 'gi',
    message: 'Debug.Print statement detected. Remove before production.',
    remediation:
      'Use Debug.WriteLine or a logging framework instead. Debug.Print is legacy and should not be used.',
    enabled: true,
    examples: {
      bad: 'Debug.Print("Value: " + data);',
      good: 'Debug.WriteLine("Value: " + data);',
    },
  },

  {
    id: 'CS-DBG-003',
    name: 'Debug Assert',
    description: 'Debug.Assert statements are debugging tools that should be removed',
    category: 'debug',
    severity: 'info',
    languages: ['csharp'],
    pattern: 'Debug\\.Assert\\s*\\(',
    patternFlags: 'gi',
    message: 'Debug.Assert statement detected. Use unit tests instead.',
    remediation:
      'Replace assertions with proper unit tests. Debug.Assert is not a substitute for testing.',
    enabled: true,
    examples: {
      bad: 'Debug.Assert(value > 0, "Value must be positive");',
      good: '[Test]\npublic void Value_MustBePositive() { Assert.Greater(value, 0); }',
    },
  },

  {
    id: 'CS-DBG-004',
    name: 'Trace WriteLine',
    description: 'Trace.WriteLine statements should typically be removed or controlled',
    category: 'debug',
    severity: 'info',
    languages: ['csharp'],
    pattern: 'Trace\\.WriteLine\\s*\\(',
    patternFlags: 'gi',
    message: 'Trace.WriteLine statement detected. Consider using structured logging.',
    remediation:
      'Use a logging framework with proper configuration for trace-level output. Remove from production code.',
    enabled: true,
    examples: {
      bad: 'Trace.WriteLine("Trace: " + info);',
      good: 'logger.Trace("Trace: {info}", info);',
    },
  },

  {
    id: 'CS-DBG-005',
    name: 'Trace Write',
    description: 'Trace.Write statements should typically be removed or controlled',
    category: 'debug',
    severity: 'info',
    languages: ['csharp'],
    pattern: 'Trace\\.Write\\s*\\(',
    patternFlags: 'gi',
    message: 'Trace.Write statement detected. Consider using structured logging.',
    remediation:
      'Use a logging framework instead of Trace. Ensure trace-level output is disabled in production.',
    enabled: true,
    examples: {
      bad: 'Trace.Write("Processing...");',
      good: 'logger.Trace("Processing...");',
    },
  },

  {
    id: 'CS-DBG-006',
    name: 'Console WriteLine',
    description: 'Console.WriteLine in non-console apps should be removed',
    category: 'debug',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'Console\\.WriteLine\\s*\\(',
    patternFlags: 'gi',
    message: 'Console.WriteLine detected. Use proper logging for non-console applications.',
    remediation:
      'Use a logging framework instead. Console.WriteLine is inappropriate for web applications, services, and libraries.',
    enabled: true,
    examples: {
      bad: 'Console.WriteLine("Processing complete");',
      good: 'logger.Information("Processing complete");',
    },
  },

  {
    id: 'CS-DBG-007',
    name: 'Console Write',
    description: 'Console.Write in non-console apps should be removed',
    category: 'debug',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'Console\\.Write\\s*\\(',
    patternFlags: 'gi',
    message: 'Console.Write detected. Use proper logging instead.',
    remediation:
      'Replace with a proper logging framework. Console.Write is only appropriate for console applications.',
    enabled: true,
    examples: {
      bad: 'Console.Write("Status: ");',
      good: 'logger.Information("Status: {status}", status);',
    },
  },

  {
    id: 'CS-DBG-008',
    name: 'Debugger Break',
    description: 'Debugger.Break() will pause execution in debuggers',
    category: 'debug',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'Debugger\\.Break\\s*\\(\\)',
    patternFlags: 'gi',
    message: 'Debugger.Break() detected. This will pause execution if a debugger is attached.',
    remediation:
      'Remove Debugger.Break() before production. Use conditional compilation (#if DEBUG) if you need it for debugging.',
    enabled: true,
    examples: {
      bad: 'if (error) { Debugger.Break(); }',
      good: '#if DEBUG\nif (error) { Debugger.Break(); }\n#endif',
    },
  },

  {
    id: 'CS-DBG-009',
    name: 'Debugger Launch',
    description: 'Debugger.Launch() will launch a debugger',
    category: 'debug',
    severity: 'critical',
    languages: ['csharp'],
    pattern: 'Debugger\\.Launch\\s*\\(\\)',
    patternFlags: 'gi',
    message: 'Debugger.Launch() detected. This will attempt to launch a debugger.',
    remediation:
      'Remove Debugger.Launch() immediately. This should never appear in production code.',
    enabled: true,
    examples: {
      bad: 'Debugger.Launch();',
      good: '// Remove entirely or use conditional compilation',
    },
  },

  {
    id: 'CS-DBG-010',
    name: 'TODO Comment',
    description: 'TODO comments indicate incomplete work that should be addressed',
    category: 'debug',
    severity: 'info',
    languages: ['csharp'],
    pattern: '//\\s*TODO\\s*[:)]',
    patternFlags: 'gi',
    message: 'TODO comment detected. Address the incomplete work or remove the comment.',
    remediation:
      'Create a GitHub issue or ticket for the TODO item. Remove the comment or use your issue tracking system.',
    enabled: true,
    examples: {
      bad: '// TODO: Fix this later\nvar result = DoSomething();',
      good: '// See issue #123 for fix\nvar result = DoSomething();',
    },
  },

  {
    id: 'CS-DBG-011',
    name: 'HACK Comment',
    description: 'HACK comments indicate code shortcuts that may need attention',
    category: 'debug',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '//\\s*HACK\\s*[:)]',
    patternFlags: 'gi',
    message: 'HACK comment detected. This indicates a code shortcut that may need refactoring.',
    remediation:
      'Refactor the code or create an issue to track the improvement. Document why the hack is necessary.',
    enabled: true,
    examples: {
      bad: '// HACK: Quick fix for deadline\nreturn results.Take(10);',
      good: '// Temporary: Limited to 10 items. See issue #456 for proper pagination\nreturn results.Take(10);',
    },
  },

  {
    id: 'CS-DBG-012',
    name: 'FIXME Comment',
    description: 'FIXME comments indicate code that needs to be fixed',
    category: 'debug',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '//\\s*FIXME\\s*[:)]',
    patternFlags: 'gi',
    message: 'FIXME comment detected. This code needs to be fixed.',
    remediation:
      'Fix the identified issue or create a tracking ticket. Remove the comment once fixed.',
    enabled: true,
    examples: {
      bad: '// FIXME: Memory leak in this method\nprivate void ProcessData() { /* ... */ }',
      good: '// Fixed memory leak - see PR #789\nprivate void ProcessData() { /* ... */ }',
    },
  },
];

/**
 * Export function to get C# debug rules
 */
export function getCSharpDebugRules(): Rule[] {
  return csharpDebugRules;
}
