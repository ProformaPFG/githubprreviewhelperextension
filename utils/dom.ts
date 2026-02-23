/**
 * DOM utilities for content script
 */

import type { CodeLine, ExtractedCode } from '../types.js';
import { detectLanguage, isSupportedLanguage } from './language.js';

/**
 * Extract file path from the GitHub diff header
 */
export function extractFilePathFromHeader(headerElement: Element): string | null {
  // GitHub stores the file path in the data-path attribute
  const dataPath = headerElement.getAttribute('data-path');
  if (dataPath) return dataPath;
  
  // Fallback: look for file name in header text
  const headerText = headerElement.textContent;
  if (headerText) {
    // Try to extract path from header
    const match = headerText.match(/(.+?)(\s|$)/);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Check if an element is part of a diff file header
 */
export function isDiffFileHeader(element: Element): boolean {
  return element.classList.contains('file-header') ||
         element.classList.contains('file') ||
         element.getAttribute('data-path') !== null;
}

/**
 * Extract code lines from a diff table (unified or split view)
 */
export function extractCodeFromDiff(diffTableElement: Element): CodeLine[] {
  const lines: CodeLine[] = [];
  
  // Get all diff rows
  const rows = diffTableElement.querySelectorAll('tr');
  
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;
    
    // Unified diff format: [line-number-old] [line-number-new] [code]
    // Split diff format: [old-line-number] [old-code] [new-line-number] [new-code]
    
    let lineNumberElement: Element | null = null;
    let codeElement: Element | null = null;
    let isDiffAdded = false;
    let isDiffRemoved = false;
    
    // Check for unified diff format
    if (row.classList.contains('unified-diff-added') || 
        row.classList.contains('addition')) {
      isDiffAdded = true;
      // In unified view: [line-num] [code]
      lineNumberElement = cells[1];
      codeElement = cells[2];
    } else if (row.classList.contains('unified-diff-removed') || 
               row.classList.contains('deletion')) {
      isDiffRemoved = true;
      lineNumberElement = cells[0];
      codeElement = cells[2];
    } else {
      // Context line (unchanged)
      lineNumberElement = cells[1] || cells[0];
      codeElement = cells[2] || cells[1];
    }
    
    if (!lineNumberElement || !codeElement) return;
    
    // Extract line number
    const lineNumberText = lineNumberElement.textContent?.trim();
    const lineNumber = parseInt(lineNumberText || '0', 10);
    
    // Extract code content
    const codeContent = codeElement.textContent || '';
    
    if (lineNumber > 0) {
      lines.push({
        lineNumber,
        content: codeContent,
        isDiffAdded,
        isDiffRemoved,
      });
    }
  });
  
  return lines;
}

/**
 * Find all diff tables on the page
 */
export function findDiffTables(): Element[] {
  // GitHub uses <table class="diff-table"> for diffs
  return Array.from(document.querySelectorAll('table.diff-table, .js-diff-progressive-container'));
}

/**
 * Find file headers that precede diff tables
 */
export function findFileHeaders(): Element[] {
  return Array.from(document.querySelectorAll('[data-path], .file-header, .file'));
}

/**
 * Get the diff table that corresponds to a file header
 */
export function getDiffTableForHeader(headerElement: Element): Element | null {
  // Usually the diff table is the next sibling or a few elements down
  let current: Element | null = headerElement;
  
  for (let i = 0; i < 10; i++) {
    current = current?.nextElementSibling || null;
    if (!current) break;
    
    if (current.tagName === 'TABLE' || 
        current.classList.contains('diff-table') ||
        current.classList.contains('js-diff-progressive-container')) {
      return current;
    }
  }
  
  return null;
}

/**
 * Extract all code from diff view
 */
export function extractAllCodeFromPage(): ExtractedCode[] {
  const extractedFiles: ExtractedCode[] = [];
  const processedPaths = new Set<string>();
  
  const fileHeaders = findFileHeaders();
  
  fileHeaders.forEach((header) => {
    const filePath = extractFilePathFromHeader(header);
    if (!filePath || processedPaths.has(filePath)) return;
    
    processedPaths.add(filePath);
    
    const language = detectLanguage(filePath);
    if (!isSupportedLanguage(language)) return;
    
    const diffTable = getDiffTableForHeader(header);
    if (!diffTable) return;
    
    const lines = extractCodeFromDiff(diffTable);
    if (lines.length === 0) return;
    
    extractedFiles.push({
      filePath,
      language,
      lines,
    });
  });
  
  return extractedFiles;
}

/**
 * Check if we're on a GitHub PR files page
 */
export function isGitHubPRFilesPage(): boolean {
  // Check URL pattern: github.com/{owner}/{repo}/pull/{pr}/files or /changes
  const urlPattern = /github\.com\/[^/]+\/[^/]+\/pull\/\d+\/(files|changes)/;
  return urlPattern.test(window.location.href);
}

/**
 * Get the PR URL from the current page
 */
export function getPRUrl(): string {
  // Remove /files or /changes from the URL to get base PR URL
  return window.location.href.replace(/\/(files|changes).*$/, '');
}
