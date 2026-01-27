/**
 * Extended HTML Security Rules (3 additional rules)
 * 
 * HTML-SEC-006: Dangerous Iframe
 * HTML-SEC-007: Base Tag Injection Risk
 * HTML-SEC-008: SVG Script Injection
 */

import type { Rule } from '../types';

export const htmlSecurityExtendedRules: Rule[] = [
  {
    id: 'HTML-SEC-006',
    name: 'Dangerous Iframe',
    description: 'iframes without sandbox attribute can execute unrestricted code',
    category: 'security',
    severity: 'warning',
    languages: ['html'],
    pattern: '<iframe(?![^>]*sandbox)',
    patternFlags: 'gi',
    message: 'iframe tag detected without sandbox attribute. This could allow arbitrary script execution.',
    remediation:
      'Add the sandbox attribute to restrict iframe capabilities. Use the minimum required permissions: <iframe sandbox="allow-scripts allow-same-origin">',
    enabled: true,
    examples: {
      bad: '<iframe src="external-content.html"></iframe>',
      good: '<iframe src="external-content.html" sandbox="allow-scripts allow-same-origin"></iframe>',
    },
  },

  {
    id: 'HTML-SEC-007',
    name: 'Base Tag Injection Risk',
    description: 'Base tags can redirect relative URLs and bypass security measures',
    category: 'security',
    severity: 'info',
    languages: ['html'],
    pattern: '<base\\s',
    patternFlags: 'gi',
    message: 'Base tag detected. Ensure the href is from a trusted source.',
    remediation:
      'Use <base> carefully and only with trusted URLs. Consider using full URLs instead of relative URLs to reduce reliance on <base>.',
    enabled: true,
    examples: {
      bad: '<base href="https://attacker.com/">',
      good: '<base href="https://yourdomain.com/">',
    },
  },

  {
    id: 'HTML-SEC-008',
    name: 'SVG Script Injection',
    description: 'SVG elements can execute JavaScript through event handlers or embedded scripts',
    category: 'security',
    severity: 'critical',
    languages: ['html'],
    pattern: '<svg(?:[^>]*on\\w+\\s*=|[^>]*>\\s*<script)',
    patternFlags: 'gi',
    message: 'SVG element with embedded script or event handler detected. This is a critical security risk.',
    remediation:
      'Remove inline scripts and event handlers from SVG. Use CSS or external JavaScript for interactions. Sanitize SVG content using a library like DOMPurify.',
    enabled: true,
    examples: {
      bad: '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>',
      good: '<svg><circle cx="50" cy="50" r="40"/></svg> <!-- Use CSS or external JS for interactions -->',
    },
  },
];

/**
 * Export function to get extended HTML security rules
 */
export function getHTMLSecurityExtendedRules(): Rule[] {
  return htmlSecurityExtendedRules;
}
