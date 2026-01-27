/**
 * JavaScript Security Rules (5 rules)
 * 
 * Rules for detecting common JavaScript security vulnerabilities
 */

import type { Rule } from '../types';

export const jsSecurityRules: Rule[] = [
  {
    id: 'JS-SEC-001',
    name: 'eval() Usage',
    description: 'Using eval() with user input can lead to code injection vulnerabilities',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\beval\\s*\\(',
    patternFlags: 'gi',
    message: 'eval() function call detected. This is a critical security risk.',
    remediation:
      'Avoid eval() entirely. Use JSON.parse() for parsing JSON, Function constructor with proper validation, or other domain-specific solutions. Never pass user input to eval().',
    enabled: true,
    examples: {
      bad: 'const result = eval(userInput);',
      good: 'const result = JSON.parse(userInput);',
    },
  },

  {
    id: 'JS-SEC-002',
    name: 'Function Constructor',
    description: 'Using new Function() with user input can lead to code injection',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\bnew\\s+Function\\s*\\(',
    patternFlags: 'gi',
    message: 'Function constructor detected. This can be a security risk if used with user input.',
    remediation:
      'Avoid constructing functions from strings. Use proper function definitions or safe alternatives like user-defined domain-specific languages with proper sandboxing.',
    enabled: true,
    examples: {
      bad: 'const fn = new Function(userCode);',
      good: 'const fn = () => { /* trusted code */ };',
    },
  },

  {
    id: 'JS-SEC-003',
    name: 'innerHTML Assignment',
    description: 'Setting innerHTML with unsanitized data can lead to XSS vulnerabilities',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '\\.innerHTML\\s*=',
    patternFlags: 'gi',
    message: 'innerHTML assignment detected. Ensure the data is sanitized.',
    remediation:
      'Use textContent for text content, or sanitize HTML with DOMPurify before assigning to innerHTML. Consider using safer methods like element.append() with text nodes.',
    enabled: true,
    examples: {
      bad: 'element.innerHTML = userInput;',
      good: 'element.textContent = userInput; // or use DOMPurify',
    },
  },

  {
    id: 'JS-SEC-010',
    name: 'Hardcoded API Key',
    description: 'API keys should never be hardcoded in source code',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '(["\'])(sk-[a-zA-Z0-9\\\\-_]{20,}|api[_-]?key)',
    patternFlags: 'gi',
    message: 'Hardcoded API key detected. Move to environment variables.',
    remediation:
      'Never commit API keys to version control. Use environment variables, secret management systems, or configuration files excluded from version control.',
    enabled: true,
    examples: {
      bad: 'const apiKey = "sk-1234567890abcdefghij";',
      good: 'const apiKey = process.env.OPENAI_API_KEY;',
    },
  },

  {
    id: 'JS-SEC-011',
    name: 'Hardcoded Password',
    description: 'Passwords should never be hardcoded in source code',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    pattern: '(password|passwd|pwd|secret|token)\\\\s*[:=]\\\\s*["\']',
    patternFlags: 'gi',
    message: 'Hardcoded password or credential detected. Move to environment variables.',
    remediation:
      'Never commit passwords or credentials to version control. Use environment variables, secret management services, or OAuth/token-based authentication.',
    enabled: true,
    examples: {
      bad: 'const password = "my-secret-password";',
      good: 'const password = process.env.DB_PASSWORD;',
    },
  },
];

/**
 * Export function to get JavaScript security rules
 */
export function getJavaScriptSecurityRules(): Rule[] {
  return jsSecurityRules;
}
