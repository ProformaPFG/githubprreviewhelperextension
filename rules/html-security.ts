/**
 * HTML Security Rules (5 rules)
 * 
 * Rules for detecting common HTML security vulnerabilities
 */

import type { Rule } from '../types';

export const htmlSecurityRules: Rule[] = [
  {
    id: 'HTML-SEC-001',
    name: 'Inline Event Handler',
    description: 'Inline event handlers (onclick, onload, etc.) can be security risks',
    category: 'security',
    severity: 'warning',
    languages: ['html'],
    pattern: 'on\\w+\\s*=\\s*["\']',
    patternFlags: 'gi',
    message: 'Inline event handlers detected. Use addEventListener() instead.',
    remediation:
      'Move event handling to external JavaScript file and use addEventListener() to attach handlers. This separates concerns and makes security policies easier to enforce.',
    enabled: true,
    examples: {
      bad: '<button onclick="handleClick()">Click me</button>',
      good:
        '<button id="my-btn">Click me</button>\n<script>\n  document.getElementById("my-btn").addEventListener("click", handleClick);\n</script>',
    },
  },

  {
    id: 'HTML-SEC-002',
    name: 'JavaScript URL',
    description: 'JavaScript URLs can be used for XSS attacks',
    category: 'security',
    severity: 'critical',
    languages: ['html'],
    pattern: '(href|src|data)\\s*=\\s*["\']javascript:',
    patternFlags: 'gi',
    message: 'JavaScript URL detected. Use proper event handlers instead.',
    remediation:
      'Remove javascript: URLs and use proper event listeners. For links, use href="#" with preventDefault, or use <button> elements for actions.',
    enabled: true,
    examples: {
      bad: '<a href="javascript:void(0)" onclick="doSomething()">Link</a>',
      good: '<a href="#" id="my-link">Link</a>\n<script>\n  document.getElementById("my-link").addEventListener("click", (e) => {\n    e.preventDefault();\n    doSomething();\n  });\n</script>',
    },
  },

  {
    id: 'HTML-SEC-003',
    name: 'Inline Script',
    description: 'Inline <script> tags can bypass Content Security Policies',
    category: 'security',
    severity: 'warning',
    languages: ['html'],
    pattern: '<script(?![^>]*src)[^>]*>',
    patternFlags: 'gi',
    message: 'Inline script tag detected. Move to external file for better CSP compliance.',
    remediation:
      'Move inline JavaScript to external .js files and reference them with <script src="...">. This enables Content Security Policy and better caching.',
    enabled: true,
    examples: {
      bad: '<script>\n  console.log("Hello");\n</script>',
      good: '<script src="app.js"></script>',
    },
  },

  {
    id: 'HTML-SEC-004',
    name: 'Missing noopener on target blank',
    description: 'Links with target="_blank" should have rel="noopener" to prevent tabnabbing',
    category: 'security',
    severity: 'warning',
    languages: ['html'],
    pattern: 'target\\s*=\\s*["\']_blank["\'](?![^<]*rel\\s*=\\s*["\'][^"\']*noopener)',
    patternFlags: 'gi',
    message: 'target="_blank" without rel="noopener" detected. This allows the opened page to access window.opener.',
    remediation:
      'Add rel="noopener" to links that open in new tabs/windows. This prevents tabnabbing attacks where the opened page can redirect the original page.',
    enabled: true,
    examples: {
      bad: '<a href="https://example.com" target="_blank">External Link</a>',
      good: '<a href="https://example.com" target="_blank" rel="noopener">External Link</a>',
    },
  },

  {
    id: 'HTML-SEC-005',
    name: 'Form Without CSRF Protection',
    description: 'Forms should include CSRF token fields for POST requests',
    category: 'security',
    severity: 'warning',
    languages: ['html'],
    pattern: '<form(?![^>]*csrf|[^>]*token)[^>]*method\\s*=\\s*["\']post["\']',
    patternFlags: 'gi',
    message: 'Form with POST method detected without apparent CSRF token.',
    remediation:
      'Include a CSRF token field in forms that modify data. Most frameworks provide middleware for this (e.g., Flask-WTF, Django, Express.js middleware).',
    enabled: true,
    examples: {
      bad: '<form method="post" action="/submit"><input name="data"><button>Submit</button></form>',
      good:
        '<form method="post" action="/submit"><input type="hidden" name="csrf_token" value="..."><input name="data"><button>Submit</button></form>',
    },
  },
];

/**
 * Export function to get HTML security rules
 */
export function getHTMLSecurityRules(): Rule[] {
  return htmlSecurityRules;
}
