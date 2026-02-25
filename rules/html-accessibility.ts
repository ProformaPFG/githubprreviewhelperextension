/**
 * HTML Accessibility Rules (4 rules)
 *
 * Common accessibility issues in HTML that affect screen readers,
 * keyboard users, and WCAG compliance.
 */

import type { Rule } from '../types.js';

export const htmlAccessibilityRules: Rule[] = [
  {
    id: 'HTML-ACC-001',
    name: 'Image Missing alt Attribute',
    description: 'Images without alt text are inaccessible to screen readers',
    category: 'quality',
    severity: 'warning',
    languages: ['html', 'svelte'],
    pattern: '<img(?![^>]*\\balt\\s*=)[^>]*\\/?>',
    patternFlags: 'gi',
    message: '<img> element missing alt attribute. Screen readers cannot describe this image.',
    remediation:
      'Add alt="" for decorative images or a descriptive alt="..." for meaningful images. WCAG 2.1 requires all images to have alt text.',
    enabled: true,
    examples: {
      bad: '<img src="logo.png">',
      good: '<img src="logo.png" alt="Company logo">\n<!-- Decorative: -->\n<img src="divider.png" alt="">',
    },
  },

  {
    id: 'HTML-ACC-002',
    name: 'Button Missing type Attribute',
    description: 'Buttons without a type attribute default to type="submit" inside forms',
    category: 'quality',
    severity: 'info',
    languages: ['html', 'svelte'],
    pattern: '<button(?![^>]*\\btype\\s*=)[^>]*>',
    patternFlags: 'gi',
    message: '<button> missing type attribute. Defaults to type="submit" inside a <form>, which may trigger unexpected form submissions.',
    remediation:
      'Always set type="button" for non-submit buttons, type="submit" for form submission, type="reset" for form reset.',
    enabled: true,
    examples: {
      bad: '<button onclick="openMenu()">Menu</button>',
      good: '<button type="button" onclick="openMenu()">Menu</button>',
    },
  },

  {
    id: 'HTML-ACC-003',
    name: 'html Element Missing lang Attribute',
    description: 'The lang attribute on <html> helps screen readers use the correct language',
    category: 'quality',
    severity: 'warning',
    languages: ['html', 'svelte'],
    pattern: '<html(?![^>]*\\blang\\s*=)[^>]*>',
    patternFlags: 'gi',
    message: '<html> element missing lang attribute. Screen readers need this to select the correct language.',
    remediation:
      'Add lang="en" (or appropriate BCP 47 language tag) to the <html> element. Required by WCAG 2.1 Success Criterion 3.1.1.',
    enabled: true,
    examples: {
      bad: '<html>',
      good: '<html lang="en">',
    },
  },

  {
    id: 'HTML-ACC-004',
    name: 'Anchor Without href',
    description: 'Anchor elements without href are not keyboard focusable and mislead assistive technology',
    category: 'quality',
    severity: 'info',
    languages: ['html', 'svelte'],
    pattern: '<a(?![^>]*\\bhref\\s*=)[^>]*>',
    patternFlags: 'gi',
    message: '<a> element without href attribute. This is not keyboard navigable and confuses assistive technology.',
    remediation:
      'Use <button> for clickable actions without navigation. If linking, provide a valid href. Avoid <a> as a generic interactive element.',
    enabled: true,
    examples: {
      bad: '<a onclick="openModal()">Open modal</a>',
      good: '<button type="button" onclick="openModal()">Open modal</button>',
    },
  },
];

/**
 * Export function to get HTML accessibility rules
 */
export function getHTMLAccessibilityRules(): Rule[] {
  return htmlAccessibilityRules;
}
