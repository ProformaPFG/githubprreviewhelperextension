/**
 * Quick comment templates for GitHub Code Review Assistant
 */

interface CommentTemplate {
  id: string;
  shortcut: string;
  label: string;
  text: string;
}

const DEFAULT_TEMPLATES: CommentTemplate[] = [
  {
    id: 'tests',
    shortcut: '1',
    label: 'Add tests',
    text: 'Please add unit tests for this change to ensure it works as expected and prevent regressions.'
  },
  {
    id: 'error-handling',
    shortcut: '2',
    label: 'Error handling',
    text: 'Could you add error handling here? What happens if this operation fails?'
  },
  {
    id: 'explain',
    shortcut: '3',
    label: 'Add comment',
    text: 'Could you add a comment explaining why this approach was chosen? It will help future maintainers.'
  },
  {
    id: 'duplicate',
    shortcut: '4',
    label: 'Duplication',
    text: 'This logic appears to duplicate existing code. Consider extracting to a shared utility.'
  },
  {
    id: 'lgtm',
    shortcut: '5',
    label: 'LGTM',
    text: 'LGTM! Nice clean implementation.'
  },
  {
    id: 'naming',
    shortcut: '6',
    label: 'Naming',
    text: 'Consider a more descriptive name here that better conveys the intent.'
  },
  {
    id: 'simplify',
    shortcut: '7',
    label: 'Simplify',
    text: 'This could be simplified. Would you consider a more straightforward approach?'
  },
  {
    id: 'security',
    shortcut: '8',
    label: 'Security',
    text: 'Please review this from a security perspective. Consider input validation and sanitization.'
  }
];

let templates: CommentTemplate[] = [...DEFAULT_TEMPLATES];
let paletteVisible = false;
let paletteElement: HTMLElement | null = null;

/**
 * Load custom templates from storage
 */
export async function loadTemplates(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('cra-comment-templates');
    if (result['cra-comment-templates']) {
      templates = result['cra-comment-templates'];
    }
  } catch (e) {
    console.log('[CRA] Using default comment templates');
  }
}

/**
 * Save templates to storage
 */
export async function saveTemplates(newTemplates: CommentTemplate[]): Promise<void> {
  templates = newTemplates;
  await chrome.storage.local.set({ 'cra-comment-templates': templates });
}

/**
 * Get the currently focused comment textarea on GitHub
 */
function getActiveCommentBox(): HTMLTextAreaElement | null {
  // GitHub's comment textareas
  const selectors = [
    'textarea[name="comment[body]"]',
    'textarea.comment-form-textarea',
    'textarea[id^="new_comment_field"]',
    'textarea[placeholder*="comment"]',
    'textarea[aria-label*="comment"]'
  ];

  for (const selector of selectors) {
    const textarea = document.querySelector(selector) as HTMLTextAreaElement;
    if (textarea) return textarea;
  }

  return null;
}

/**
 * Insert text into a textarea
 */
function insertText(textarea: HTMLTextAreaElement, text: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;

  // Trigger input event for GitHub's handlers
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}

/**
 * Create and show the command palette
 */
function showPalette(): void {
  if (paletteVisible) {
    hidePalette();
    return;
  }

  paletteElement = document.createElement('div');
  paletteElement.id = 'cra-comment-palette';
  paletteElement.innerHTML = `
    <div class="cra-palette-content">
      <div class="cra-palette-header">
        <span>Quick Comment Templates</span>
        <span class="cra-palette-hint">Press number or click to insert</span>
      </div>
      <ul class="cra-palette-list">
        ${templates.map(t => `
          <li data-id="${t.id}" data-shortcut="${t.shortcut}">
            <kbd>${t.shortcut}</kbd>
            <span class="cra-palette-label">${t.label}</span>
            <span class="cra-palette-preview">${t.text.substring(0, 50)}${t.text.length > 50 ? '...' : ''}</span>
          </li>
        `).join('')}
      </ul>
      <div class="cra-palette-footer">
        <kbd>Esc</kbd> to close · <kbd>Ctrl+Shift+T</kbd> to toggle
      </div>
    </div>
  `;

  // Styles
  paletteElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10004;
    width: 500px;
    max-width: 90vw;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  `;

  const content = paletteElement.querySelector('.cra-palette-content') as HTMLElement;
  content.style.cssText = `
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    overflow: hidden;
  `;

  const header = paletteElement.querySelector('.cra-palette-header') as HTMLElement;
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f6f8fa;
    border-bottom: 1px solid #d0d7de;
    font-weight: 600;
    font-size: 14px;
  `;

  const hint = paletteElement.querySelector('.cra-palette-hint') as HTMLElement;
  hint.style.cssText = `
    font-weight: normal;
    font-size: 12px;
    color: #656d76;
  `;

  const list = paletteElement.querySelector('.cra-palette-list') as HTMLElement;
  list.style.cssText = `
    list-style: none;
    margin: 0;
    padding: 8px 0;
    max-height: 400px;
    overflow-y: auto;
  `;

  paletteElement.querySelectorAll('li').forEach(li => {
    (li as HTMLElement).style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.1s;
    `;

    li.addEventListener('mouseenter', () => {
      (li as HTMLElement).style.background = '#f6f8fa';
    });
    li.addEventListener('mouseleave', () => {
      (li as HTMLElement).style.background = '';
    });
    li.addEventListener('click', () => {
      const id = li.getAttribute('data-id');
      const template = templates.find(t => t.id === id);
      if (template) {
        insertTemplate(template);
      }
    });
  });

  paletteElement.querySelectorAll('kbd').forEach(kbd => {
    (kbd as HTMLElement).style.cssText = `
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 2px 8px;
      font-family: monospace;
      font-size: 12px;
      min-width: 24px;
      text-align: center;
    `;
  });

  paletteElement.querySelectorAll('.cra-palette-label').forEach(label => {
    (label as HTMLElement).style.cssText = `
      font-weight: 500;
      min-width: 120px;
    `;
  });

  paletteElement.querySelectorAll('.cra-palette-preview').forEach(preview => {
    (preview as HTMLElement).style.cssText = `
      color: #656d76;
      font-size: 12px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
  });

  const footer = paletteElement.querySelector('.cra-palette-footer') as HTMLElement;
  footer.style.cssText = `
    padding: 8px 16px;
    background: #f6f8fa;
    border-top: 1px solid #d0d7de;
    font-size: 12px;
    color: #656d76;
    text-align: center;
  `;

  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'cra-palette-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    z-index: 10003;
  `;
  backdrop.addEventListener('click', hidePalette);

  document.body.appendChild(backdrop);
  document.body.appendChild(paletteElement);
  paletteVisible = true;

  // Focus for keyboard handling
  paletteElement.setAttribute('tabindex', '-1');
  paletteElement.focus();
}

/**
 * Hide the command palette
 */
function hidePalette(): void {
  if (paletteElement) {
    paletteElement.remove();
    paletteElement = null;
  }
  const backdrop = document.getElementById('cra-palette-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
  paletteVisible = false;
}

/**
 * Insert a template into the active comment box
 */
function insertTemplate(template: CommentTemplate): void {
  hidePalette();

  const textarea = getActiveCommentBox();
  if (textarea) {
    insertText(textarea, template.text);
  } else {
    // Find the nearest "Add a comment" button and click it
    const addCommentBtn = document.querySelector('button[data-hotkey="c"]') as HTMLButtonElement;
    if (addCommentBtn) {
      addCommentBtn.click();
      // Wait for textarea to appear
      setTimeout(() => {
        const newTextarea = getActiveCommentBox();
        if (newTextarea) {
          insertText(newTextarea, template.text);
        }
      }, 100);
    } else {
      console.log('[CRA] No comment box found. Click on a line to add a comment first.');
    }
  }
}

/**
 * Handle keyboard events for the palette
 */
function handlePaletteKeydown(e: KeyboardEvent): void {
  if (!paletteVisible) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    hidePalette();
    return;
  }

  // Number keys 1-9
  if (/^[1-9]$/.test(e.key)) {
    const template = templates.find(t => t.shortcut === e.key);
    if (template) {
      e.preventDefault();
      insertTemplate(template);
    }
  }
}

/**
 * Handle global keyboard shortcut
 */
function handleGlobalKeydown(e: KeyboardEvent): void {
  // Ctrl+Shift+T or Cmd+Shift+T
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
    e.preventDefault();
    showPalette();
  }

  if (paletteVisible) {
    handlePaletteKeydown(e);
  }
}

/**
 * Initialize quick comments
 */
export function initQuickComments(): void {
  loadTemplates();
  document.addEventListener('keydown', handleGlobalKeydown);
  console.log('[CRA] Quick comments initialized. Press Ctrl+Shift+T to open.');
}

/**
 * Cleanup
 */
export function destroyQuickComments(): void {
  document.removeEventListener('keydown', handleGlobalKeydown);
  hidePalette();
}
