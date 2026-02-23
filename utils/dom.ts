/**
 * DOM utilities for content script
 */

import type { CodeLine, ExtractedCode } from '../types.js';
import { detectLanguage, isSupportedLanguage } from './language.js';

/**
 * Diff table selectors for GitHub's various UI versions
 */
const DIFF_TABLE_SELECTORS = [
  'table.diff-table',
  'table.js-diff-table',
  'table[data-tab-size]',
].join(', ');

/**
 * Extract a file path from arbitrary text (looks for known extension patterns)
 */
function extractPathFromText(text: string): string | null {
  // Match text that looks like a file path ending in a known extension
  const match = text.trim().match(/([^\s"'<>]+\.(html?|tsx?|jsx?|css|s[ac]ss|less|cs))/i);
  return match ? match[1] : null;
}

/**
 * Find the file path for a diff table — handles GitHub's React UI and legacy DOM
 */
function findFilePathForTable(table: Element): string | null {
  // Strategy 1: GitHub's new React PR UI uses role="region" with aria-labelledby
  // pointing to a heading element that contains the filename
  const regionEl = table.closest('[role="region"][aria-labelledby]');
  if (regionEl) {
    const labelId = regionEl.getAttribute('aria-labelledby');
    if (labelId) {
      const heading = document.getElementById(labelId);
      if (heading) {
        // Try aria-label first (most explicit)
        const ariaLabel = heading.getAttribute('aria-label');
        if (ariaLabel) {
          const p = extractPathFromText(ariaLabel);
          if (p) return p;
        }
        // Try text content (may include icon text — extractPathFromText filters noise)
        const p = extractPathFromText(heading.textContent || '');
        if (p) return p;
      }
    }
  }

  // Strategy 2: Legacy GitHub — data-path on ancestor or nearby header
  let el: Element | null = table;
  for (let i = 0; i < 15; i++) {
    el = el?.parentElement || null;
    if (!el || el === document.body) break;

    const direct = el.getAttribute('data-path');
    if (direct) return direct;

    const header = el.querySelector(':scope > [data-path], :scope > * > [data-path]');
    if (header) return header.getAttribute('data-path');
  }

  return null;
}

/**
 * Extract code lines from a diff table (handles GitHub's current DOM structure)
 */
export function extractCodeFromDiff(diffTableElement: Element): CodeLine[] {
  const lines: CodeLine[] = [];

  const rows = diffTableElement.querySelectorAll('tr');

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;

    // Determine diff type from row/cell classes (modern and legacy GitHub)
    const isDiffAdded =
      row.classList.contains('blob-code-addition') ||
      row.classList.contains('addition') ||
      row.classList.contains('unified-diff-added') ||
      !!row.querySelector('[data-code-marker="+"]');

    const isDiffRemoved =
      row.classList.contains('blob-code-deletion') ||
      row.classList.contains('deletion') ||
      row.classList.contains('unified-diff-removed') ||
      !!row.querySelector('[data-code-marker="-"]');

    // Line number: prefer data-line-number attribute (GitHub's modern format)
    let lineNumber = 0;
    for (const cell of cells) {
      const attr = cell.getAttribute('data-line-number');
      if (attr) {
        const n = parseInt(attr, 10);
        if (n > 0) { lineNumber = n; break; }
      }
    }

    // Fallback: parse line number from cell text content
    if (lineNumber === 0) {
      for (let i = 0; i < Math.min(2, cells.length - 1); i++) {
        const text = cells[i].textContent?.trim();
        const n = text ? parseInt(text, 10) : 0;
        if (n > 0) { lineNumber = n; break; }
      }
    }

    // Code content: prefer blob-code cell, fall back to last cell
    const codeCell = row.querySelector('td.blob-code, td[data-line-content]');
    const codeContent = (codeCell ?? cells[cells.length - 1])?.textContent ?? '';

    if (lineNumber > 0) {
      lines.push({ lineNumber, content: codeContent, isDiffAdded, isDiffRemoved });
    }
  });

  return lines;
}

/**
 * Extract all code from diff view — robust against GitHub DOM changes
 */
export function extractAllCodeFromPage(): ExtractedCode[] {
  const extractedFiles: ExtractedCode[] = [];
  const processedPaths = new Set<string>();

  // Strategy 1: find diff tables and walk UP to get file paths
  const tables = document.querySelectorAll(DIFF_TABLE_SELECTORS);

  tables.forEach((table) => {
    const filePath = findFilePathForTable(table);
    if (!filePath || processedPaths.has(filePath)) return;

    const language = detectLanguage(filePath);
    if (!isSupportedLanguage(language)) return;

    processedPaths.add(filePath);

    const lines = extractCodeFromDiff(table);
    if (lines.length === 0) return;

    extractedFiles.push({ filePath, language, lines });
  });

  // Strategy 2 (fallback): find [data-path] headers, look for table within file container
  const pathElements = document.querySelectorAll('[data-path]');

  pathElements.forEach((el) => {
    const filePath = el.getAttribute('data-path');
    if (!filePath || processedPaths.has(filePath)) return;

    const language = detectLanguage(filePath);
    if (!isSupportedLanguage(language)) return;

    // Find the enclosing file container, then the table within it
    const container = el.closest('.file, .js-file, [data-file-type]') ?? el.parentElement;
    const table = container?.querySelector(DIFF_TABLE_SELECTORS);
    if (!table) return;

    processedPaths.add(filePath);

    const lines = extractCodeFromDiff(table);
    if (lines.length === 0) return;

    extractedFiles.push({ filePath, language, lines });
  });

  return extractedFiles;
}

/**
 * Check if we're on a GitHub PR files page
 */
export function isGitHubPRFilesPage(): boolean {
  const urlPattern = /github\.com\/[^/]+\/[^/]+\/pull\/\d+\/(files|changes)/;
  return urlPattern.test(window.location.href);
}

/**
 * Get the PR URL from the current page
 */
export function getPRUrl(): string {
  return window.location.href.replace(/\/(files|changes).*$/, '');
}
