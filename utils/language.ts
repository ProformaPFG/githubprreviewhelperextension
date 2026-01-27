/**
 * Utilities for language detection and file handling
 */

import type { Language } from './types';

/**
 * Map of file extensions to language types
 */
const EXTENSION_TO_LANGUAGE: Record<string, Language> = {
  // HTML
  'html': 'html',
  'htm': 'html',
  
  // CSS
  'css': 'css',
  'scss': 'css',
  'sass': 'css',
  'less': 'css',
  
  // JavaScript variants
  'js': 'javascript',
  'mjs': 'javascript',
  'cjs': 'javascript',
  'ts': 'typescript',
  'tsx': 'tsx',
  'jsx': 'jsx',
  
  // C#
  'cs': 'csharp',
};

/**
 * Detect language from file path/extension
 */
export function detectLanguage(filePath: string): Language | null {
  const match = filePath.match(/\.([^.]+)$/);
  if (!match) return null;
  
  const extension = match[1].toLowerCase();
  return EXTENSION_TO_LANGUAGE[extension] || null;
}

/**
 * Get file name from path
 */
export function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

/**
 * Get file directory from path
 */
export function getFileDirectory(filePath: string): string {
  const parts = filePath.split('/');
  parts.pop();
  return parts.join('/');
}

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(language: Language | null): language is Language {
  if (!language) return false;
  const supported: Language[] = ['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx', 'csharp'];
  return supported.includes(language);
}

/**
 * Normalize line endings to \n
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Split code into lines while preserving line numbers
 */
export function splitIntoLines(code: string): string[] {
  return normalizeLineEndings(code).split('\n');
}
