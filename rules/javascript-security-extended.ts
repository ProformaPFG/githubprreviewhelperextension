/**
 * Extended JavaScript Security Rules (13 additional rules)
 * 
 * Rules JS-SEC-004 through JS-SEC-018
 */

import type { Rule } from '../types.js';

export const jsSecurityExtendedRules: Rule[] = [
  {
    id: 'JS-SEC-004',
    name: 'OuterHTML Assignment',
    description: 'Setting outerHTML with unsanitized data can lead to XSS vulnerabilities',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\.outerHTML\\s*=',
    patternFlags: 'gi',
    message: 'outerHTML assignment detected. Ensure the data is sanitized.',
    remediation:
      'Use textContent for text-only content, or sanitize HTML with DOMPurify before assignment. Consider using safer methods like replaceWith().',
    enabled: true,
    examples: {
      bad: 'element.outerHTML = userInput;',
      good: 'element.replaceWith(sanitizedHTML); // Use DOMPurify',
    },
  },

  {
    id: 'JS-SEC-005',
    name: 'Document Write',
    description: 'document.write() can be a security risk and negatively impacts performance',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\bdocument\\.write\\s*\\(',
    patternFlags: 'gi',
    message: 'document.write() call detected. This is outdated and can cause security issues.',
    remediation:
      'Use modern DOM methods like appendChild(), innerHTML, or a frontend framework instead of document.write().',
    enabled: true,
    examples: {
      bad: 'document.write("<h1>" + title + "</h1>");',
      good: 'const h1 = document.createElement("h1");\nh1.textContent = title;\ndocument.body.appendChild(h1);',
    },
  },

  {
    id: 'JS-SEC-006',
    name: 'InsertAdjacentHTML',
    description: 'insertAdjacentHTML with unsanitized data can lead to XSS',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\.insertAdjacentHTML\\s*\\(',
    patternFlags: 'gi',
    message: 'insertAdjacentHTML call detected. Ensure the HTML is sanitized.',
    remediation:
      'Use insertAdjacentText() for text content, or sanitize HTML with DOMPurify before using insertAdjacentHTML().',
    enabled: true,
    examples: {
      bad: 'el.insertAdjacentHTML("beforeend", userHTML);',
      good: 'el.insertAdjacentHTML("beforeend", sanitizer.sanitize(userHTML)); // Use DOMPurify',
    },
  },

  {
    id: 'JS-SEC-007',
    name: 'SetTimeout String',
    description: 'Using setTimeout with string code is equivalent to eval() and a security risk',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\bsetTimeout\\s*\\(\\s*["\']',
    patternFlags: 'gi',
    message: 'setTimeout with string code detected. Use a function instead.',
    remediation:
      'Pass a function reference or arrow function instead of a string. setTimeout(() => code(), delay) instead of setTimeout("code()", delay).',
    enabled: true,
    examples: {
      bad: 'setTimeout("doSomething()", 1000);',
      good: 'setTimeout(() => doSomething(), 1000);',
    },
  },

  {
    id: 'JS-SEC-008',
    name: 'SetInterval String',
    description: 'Using setInterval with string code is equivalent to eval() and a security risk',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\bsetInterval\\s*\\(\\s*["\']',
    patternFlags: 'gi',
    message: 'setInterval with string code detected. Use a function instead.',
    remediation:
      'Pass a function reference or arrow function instead of a string. setInterval(() => code(), delay) instead of setInterval("code()", delay).',
    enabled: true,
    examples: {
      bad: 'setInterval("updateTime()", 1000);',
      good: 'setInterval(() => updateTime(), 1000);',
    },
  },

  {
    id: 'JS-SEC-009',
    name: 'React DangerouslySetInnerHTML',
    description: 'dangerouslySetInnerHTML bypasses XSS protections and requires careful handling',
    category: 'security',
    severity: 'warning',
    languages: ['jsx', 'tsx'],
    pattern: 'dangerouslySetInnerHTML',
    patternFlags: 'gi',
    message: 'dangerouslySetInnerHTML detected. Ensure the HTML is from a trusted source and sanitized.',
    remediation:
      'Only use dangerouslySetInnerHTML with trusted, sanitized HTML. Consider using DOMPurify or a safe HTML builder. Better: use child React components instead.',
    enabled: true,
    examples: {
      bad: '<div dangerouslySetInnerHTML={{__html: userContent}} />',
      good: '<div>{sanitizer.sanitize(userContent)}</div>',
    },
  },

  {
    id: 'JS-SEC-012',
    name: 'Hardcoded Secret',
    description: 'Secrets, tokens, and credentials should never be hardcoded',
    category: 'security',
    severity: 'critical',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '(secret|token|credential)\\\\s*[:=]\\\\s*["\\\']',
    patternFlags: 'gi',
    message: 'Hardcoded secret/token/credential detected. Move to environment variables.',
    remediation:
      'Never store secrets in code. Use environment variables, secret management services (e.g., AWS Secrets Manager), or OAuth tokens.',
    enabled: true,
    examples: {
      bad: 'const token = "ghp_1234567890abcdefghij";',
      good: 'const token = process.env.GITHUB_TOKEN;',
    },
  },

  {
    id: 'JS-SEC-013',
    name: 'PostMessage No Origin Check',
    description: 'postMessage with "*" origin allows any window to receive messages',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\.postMessage\\s*\\([^,]*,\\s*["\']\\*["\']',
    patternFlags: 'gi',
    message: 'postMessage with "*" target origin detected. Specify a specific origin.',
    remediation:
      'Replace "*" with a specific origin: window.postMessage(data, "https://trusted.com"). This prevents malicious windows from receiving your messages.',
    enabled: true,
    examples: {
      bad: 'iframe.postMessage(data, "*");',
      good: 'iframe.postMessage(data, "https://trusted.com");',
    },
  },

  {
    id: 'JS-SEC-014',
    name: 'Location Assignment',
    description: 'Direct location assignment from user input can enable open redirect attacks',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\b(location|window\\.location)\\s*=',
    patternFlags: 'gi',
    message: 'location assignment detected. Validate and sanitize the URL.',
    remediation:
      'Validate URLs against a whitelist before redirecting. Use location.href = validateURL(userInput) with proper validation.',
    enabled: true,
    examples: {
      bad: 'window.location = getParam("redirect");',
      good: 'const url = getParam("redirect");\nif (isValidUrl(url)) window.location = url;',
    },
  },

  {
    id: 'JS-SEC-015',
    name: 'LocalStorage Sensitive Data',
    description: 'LocalStorage is not secure for sensitive data like tokens or passwords',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: 'localStorage\\.setItem\\s*\\(\\s*["\']?(token|auth|password|secret|key)',
    patternFlags: 'gi',
    message: 'Sensitive data in localStorage detected. Use secure storage instead.',
    remediation:
      'Use httpOnly cookies for authentication tokens, or secure session storage. Never store passwords in localStorage. Consider using IndexedDB with encryption.',
    enabled: true,
    examples: {
      bad: 'localStorage.setItem("auth_token", token);',
      good: '// Use httpOnly cookies via server, or session storage for temporary data',
    },
  },

  {
    id: 'JS-SEC-016',
    name: 'Regex Denial of Service',
    description: 'Complex regex patterns can cause catastrophic backtracking',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '\\(([a-z+]|\\\\w)\\+\\)\\+',
    patternFlags: 'gi',
    message: 'Potentially problematic regex pattern detected. This could cause ReDoS attacks.',
    remediation:
      'Avoid nested quantifiers like (a+)+ or (\\w+)+. Use atomic grouping or possessive quantifiers if available. Test regex with potentially problematic inputs.',
    enabled: true,
    examples: {
      bad: 'const pattern = /(a+)+$/;',
      good: 'const pattern = /a+$/; // Simpler and safe',
    },
  },

  {
    id: 'JS-SEC-017',
    name: 'Prototype Pollution',
    description: 'Modifying __proto__ can pollute the prototype chain',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '__proto__\\s*=',
    patternFlags: 'gi',
    message: 'Prototype modification detected. This can pollute the prototype chain.',
    remediation:
      'Avoid modifying __proto__. Use Object.create(null) for objects that shouldn\'t have a prototype, or use Object.setPrototypeOf with caution.',
    enabled: true,
    examples: {
      bad: 'obj.__proto__ = maliciousProto;',
      good: 'const obj = Object.create(null); // No prototype chain',
    },
  },

  {
    id: 'JS-SEC-018',
    name: 'Unvalidated Redirect',
    description: 'Redirecting to user-provided URLs without validation enables phishing',
    category: 'security',
    severity: 'warning',
    languages: ['javascript', 'typescript', 'jsx', 'tsx', 'svelte'],
    pattern: '(location|redirect)\\s*=\\s*.*(?:getParam|getUserInput|request\\[)',
    patternFlags: 'gi',
    message: 'Unvalidated redirect detected. Validate the URL before redirecting.',
    remediation:
      'Maintain a whitelist of allowed redirect URLs. Validate user-provided URLs against this list before redirecting. Warn users of external redirects.',
    enabled: true,
    examples: {
      bad: 'const next = request.query.next;\nwindow.location = next; // Vulnerable',
      good: 'const next = request.query.next;\nif (isAllowedUrl(next)) window.location = next;',
    },
  },
];

/**
 * Export function to get extended JavaScript security rules
 */
export function getJavaScriptSecurityExtendedRules(): Rule[] {
  return jsSecurityExtendedRules;
}
