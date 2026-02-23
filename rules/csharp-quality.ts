/**
 * C# Code Quality Rules (8 rules)
 *
 * Common coding issues and anti-patterns in C# that cause bugs,
 * deadlocks, or silent failures in production.
 */

import type { Rule } from '../types.js';

export const csharpQualityRules: Rule[] = [
  {
    id: 'CS-QUAL-001',
    name: 'async void Method',
    description: 'async void methods swallow exceptions and cannot be awaited',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'async\\s+void\\s+\\w+\\s*\\(',
    patternFlags: 'gi',
    message: 'async void method detected. Exceptions thrown inside are unobservable and will crash the process. Use async Task instead.',
    remediation:
      'Change the return type to Task. Exception: event handlers (e.g. Button_Click) must remain async void — all others should return Task.',
    enabled: true,
    examples: {
      bad: 'public async void LoadData() { await _service.FetchAsync(); }',
      good: 'public async Task LoadData() { await _service.FetchAsync(); }',
    },
  },

  {
    id: 'CS-QUAL-002',
    name: 'Blocking .Result on Task',
    description: '.Result blocks the calling thread and can cause deadlocks in ASP.NET and UI contexts',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '\\.Result\\b',
    patternFlags: 'g',
    message: 'Synchronous .Result on a Task detected. This blocks the thread and can deadlock in ASP.NET or UI contexts. Use await instead.',
    remediation:
      'Make the calling method async and use await instead of .Result. If you must block (e.g. Main), use ConfigureAwait(false) or Task.Run().Result with care.',
    enabled: true,
    examples: {
      bad: 'var user = _userService.GetUserAsync(id).Result;',
      good: 'var user = await _userService.GetUserAsync(id);',
    },
  },

  {
    id: 'CS-QUAL-003',
    name: 'Blocking .Wait() on Task',
    description: '.Wait() blocks the calling thread and can cause deadlocks',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '\\.Wait\\s*\\(',
    patternFlags: 'gi',
    message: 'Synchronous .Wait() on a Task detected. This blocks the thread and can deadlock. Use await instead.',
    remediation:
      'Make the calling method async and replace .Wait() with await.',
    enabled: true,
    examples: {
      bad: '_saveTask.Wait();',
      good: 'await _saveTask;',
    },
  },

  {
    id: 'CS-QUAL-004',
    name: 'Blocking GetAwaiter().GetResult()',
    description: 'GetAwaiter().GetResult() blocks and can deadlock in synchronization-context environments',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '\\.GetAwaiter\\s*\\(\\s*\\)\\.GetResult\\s*\\(',
    patternFlags: 'gi',
    message: 'GetAwaiter().GetResult() detected. This blocks the thread and can deadlock. Use await instead.',
    remediation:
      'Make the method async and use await. GetAwaiter().GetResult() is only safe in a context with no SynchronizationContext (e.g. console app Main).',
    enabled: true,
    examples: {
      bad: 'var result = GetDataAsync().GetAwaiter().GetResult();',
      good: 'var result = await GetDataAsync();',
    },
  },

  {
    id: 'CS-QUAL-005',
    name: 'Empty Catch Block',
    description: 'Empty catch blocks silently swallow exceptions, hiding bugs',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}',
    patternFlags: 'gi',
    message: 'Empty catch block detected. Exceptions are silently swallowed. At minimum, log the exception.',
    remediation:
      'Log the exception or rethrow it. Never silently discard exceptions. If intentional, add a comment explaining why.',
    enabled: true,
    examples: {
      bad: 'try { Process(); } catch (Exception ex) { }',
      good: 'try { Process(); } catch (Exception ex) { _logger.LogError(ex, "Process failed"); }',
    },
  },

  {
    id: 'CS-QUAL-006',
    name: 'Rethrowing Exception Loses Stack Trace',
    description: '"throw ex;" resets the stack trace. Use "throw;" to preserve it',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: '\\bcatch\\s*\\(\\s*\\w+(?:Exception)?\\s+(\\w+)\\s*\\)[\\s\\S]*?\\bthrow\\s+\\1\\s*;',
    patternFlags: 'gi',
    message: '"throw ex;" detected in a catch block. This resets the stack trace. Use plain "throw;" to rethrow and preserve the original trace.',
    remediation:
      'Replace "throw ex;" with "throw;" to preserve the original exception\'s stack trace for debugging.',
    enabled: true,
    examples: {
      bad: 'catch (Exception ex) { _log.Error(ex); throw ex; }',
      good: 'catch (Exception ex) { _log.Error(ex); throw; }',
    },
  },

  {
    id: 'CS-QUAL-007',
    name: 'Overly Broad Exception Catch',
    description: 'Catching the base Exception type catches everything including OutOfMemoryException',
    category: 'quality',
    severity: 'info',
    languages: ['csharp'],
    pattern: 'catch\\s*\\(\\s*Exception\\s+\\w+\\s*\\)',
    patternFlags: 'gi',
    message: 'Catching base Exception type. Consider catching specific exception types to avoid masking unexpected errors.',
    remediation:
      'Catch specific exception types (e.g. IOException, SqlException). Catching Exception broadly can hide bugs and makes error handling harder to reason about.',
    enabled: true,
    examples: {
      bad: 'catch (Exception ex) { HandleError(ex); }',
      good: 'catch (SqlException ex) { HandleDbError(ex); }\ncatch (TimeoutException ex) { HandleTimeout(ex); }',
    },
  },

  {
    id: 'CS-QUAL-008',
    name: 'Thread.Sleep in Async Code',
    description: 'Thread.Sleep blocks the thread. Use await Task.Delay in async methods',
    category: 'quality',
    severity: 'warning',
    languages: ['csharp'],
    pattern: 'Thread\\.Sleep\\s*\\(',
    patternFlags: 'gi',
    message: 'Thread.Sleep detected. In async code, use "await Task.Delay(ms)" to avoid blocking a thread.',
    remediation:
      'Replace Thread.Sleep(ms) with await Task.Delay(ms) in async methods. In non-async contexts, Thread.Sleep is acceptable but often indicates a design issue.',
    enabled: true,
    examples: {
      bad: 'Thread.Sleep(1000); // wait for resource',
      good: 'await Task.Delay(1000); // wait for resource',
    },
  },
];

/**
 * Export function to get C# quality rules
 */
export function getCSharpQualityRules(): Rule[] {
  return csharpQualityRules;
}
