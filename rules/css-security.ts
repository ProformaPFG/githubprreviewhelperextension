/**
 * CSS Security Rules (5 rules)
 * 
 * Rules for detecting CSS-based vulnerabilities
 */

import type { Rule } from '../types.js';

export const cssSecurityRules: Rule[] = [
  {
    id: 'CSS-SEC-001',
    name: 'Expression Function',
    description: 'CSS expression() is an IE-only feature that can execute arbitrary JavaScript',
    category: 'security',
    severity: 'critical',
    languages: ['css'],
    pattern: '\\bexpression\\s*\\(',
    patternFlags: 'gi',
    message: 'CSS expression() function detected. This is a security and compatibility risk.',
    remediation:
      'Remove CSS expression() usage. While IE6-8 support is outdated, these are security risks. Use standard CSS or JavaScript for dynamic calculations.',
    enabled: true,
    examples: {
      bad: '.box { width: expression(document.body.offsetWidth - 10); }',
      good: '.box { width: calc(100% - 10px); }',
    },
  },

  {
    id: 'CSS-SEC-002',
    name: 'Behavior Property',
    description: 'CSS behavior: property can load arbitrary code (IE legacy)',
    category: 'security',
    severity: 'critical',
    languages: ['css'],
    pattern: '\\bbehavior\\s*:',
    patternFlags: 'gi',
    message: 'CSS behavior: property detected. This is a security risk.',
    remediation:
      'Remove behavior: property usage. This IE-specific property is a significant security risk and should never be used in modern applications.',
    enabled: true,
    examples: {
      bad: '.box { behavior: url(box-animation.htc); }',
      good: '.box { animation: slideIn 0.3s ease-out; }',
    },
  },

  {
    id: 'CSS-SEC-003',
    name: 'JavaScript URL in CSS',
    description: 'URL pointing to javascript: protocol in CSS can bypass security policies',
    category: 'security',
    severity: 'critical',
    languages: ['css'],
    pattern: 'url\\s*\\(\\s*["\']?javascript:',
    patternFlags: 'gi',
    message: 'JavaScript URL in CSS detected. This is a security risk.',
    remediation:
      'Use actual image URLs or CSS features instead of javascript: URLs. Ensure all URLs point to valid resources, not script execution vectors.',
    enabled: true,
    examples: {
      bad: '.icon { background: url("javascript:alert(1)"); }',
      good: '.icon { background-image: url("images/icon.svg"); }',
    },
  },

  {
    id: 'CSS-SEC-004',
    name: 'External @import',
    description: '@import from untrusted external domains can load malicious CSS',
    category: 'security',
    severity: 'warning',
    languages: ['css'],
    pattern: '@import\\s+(?:url\\s*\\()?["\']?(https?:|//)(?!localhost)',
    patternFlags: 'gi',
    message: 'External @import detected. Ensure the domain is trusted.',
    remediation:
      'Only import CSS from trusted domains. Consider using <link> tags in HTML instead for better control and performance. Use Subresource Integrity (SRI) for external resources.',
    enabled: true,
    examples: {
      bad: '@import url("https://evil.com/styles.css");',
      good: '@import url("./local-styles.css");',
    },
  },

  {
    id: 'CSS-SEC-005',
    name: 'Moz Binding',
    description: '-moz-binding can execute arbitrary code in Firefox',
    category: 'security',
    severity: 'critical',
    languages: ['css'],
    pattern: '-moz-binding\\s*:',
    patternFlags: 'gi',
    message: '-moz-binding property detected. This is a security risk.',
    remediation:
      'Remove -moz-binding usage. This Firefox-specific property can execute arbitrary code and should never be used. Use standard CSS instead.',
    enabled: true,
    examples: {
      bad: '.box { -moz-binding: url(something.xml#binding); }',
      good: '.box { /* Use standard CSS or JavaScript instead */ }',
    },
  },
];

/**
 * Export function to get CSS security rules
 */
export function getCSSSecurityRules(): Rule[] {
  return cssSecurityRules;
}
