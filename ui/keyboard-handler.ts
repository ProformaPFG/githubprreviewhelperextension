/**
 * Keyboard navigation handler for GitHub Code Review Assistant
 */

interface KeyboardConfig {
  enabled: boolean;
  shortcuts: {
    nextFile: string;
    prevFile: string;
    nextIssue: string;
    prevIssue: string;
    goToFile: string;
    closePanel: string;
    showHelp: string;
  };
}

const DEFAULT_CONFIG: KeyboardConfig = {
  enabled: true,
  shortcuts: {
    nextFile: 'j',
    prevFile: 'k',
    nextIssue: 'n',
    prevIssue: 'p',
    goToFile: 'ctrl+g',
    closePanel: 'Escape',
    showHelp: '?'
  }
};

let config: KeyboardConfig = { ...DEFAULT_CONFIG };
let currentFileIndex = 0;
let currentIssueIndex = 0;
let helpOverlayVisible = false;
let goToFileVisible = false;

/**
 * Get all file headers in the PR diff view
 */
function getFileHeaders(): HTMLElement[] {
  return Array.from(document.querySelectorAll('.file-header, [data-path]')) as HTMLElement[];
}

/**
 * Get all issue badges created by the extension
 */
function getIssueBadges(): HTMLElement[] {
  return Array.from(document.querySelectorAll('.cra-badge')) as HTMLElement[];
}

/**
 * Scroll to and highlight a file
 */
function scrollToFile(index: number): void {
  const files = getFileHeaders();
  if (files.length === 0) return;

  currentFileIndex = Math.max(0, Math.min(index, files.length - 1));
  const file = files[currentFileIndex];

  file.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Brief highlight effect
  file.style.transition = 'background-color 0.3s';
  file.style.backgroundColor = 'rgba(255, 220, 0, 0.2)';
  setTimeout(() => {
    file.style.backgroundColor = '';
  }, 1000);
}

/**
 * Scroll to and highlight an issue
 */
function scrollToIssue(index: number): void {
  const badges = getIssueBadges();
  if (badges.length === 0) return;

  currentIssueIndex = Math.max(0, Math.min(index, badges.length - 1));
  const badge = badges[currentIssueIndex];

  badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
  badge.click(); // Trigger tooltip
}

/**
 * Show keyboard shortcuts help overlay
 */
function showHelpOverlay(): void {
  if (helpOverlayVisible) {
    hideHelpOverlay();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'cra-keyboard-help';
  overlay.innerHTML = `
    <div class="cra-help-content">
      <h3>Keyboard Shortcuts</h3>
      <table>
        <tr><td><kbd>J</kbd></td><td>Next file</td></tr>
        <tr><td><kbd>K</kbd></td><td>Previous file</td></tr>
        <tr><td><kbd>N</kbd></td><td>Next issue</td></tr>
        <tr><td><kbd>P</kbd></td><td>Previous issue</td></tr>
        <tr><td><kbd>Ctrl+G</kbd></td><td>Go to file</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Close panels</td></tr>
        <tr><td><kbd>?</kbd></td><td>Toggle this help</td></tr>
      </table>
      <p class="cra-help-hint">Press any key to close</p>
    </div>
  `;

  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10003;
  `;

  const content = overlay.querySelector('.cra-help-content') as HTMLElement;
  content.style.cssText = `
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 400px;
  `;

  const table = overlay.querySelector('table') as HTMLElement;
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  `;

  overlay.querySelectorAll('td').forEach(td => {
    (td as HTMLElement).style.cssText = 'padding: 8px; border-bottom: 1px solid #eee;';
  });

  overlay.querySelectorAll('kbd').forEach(kbd => {
    (kbd as HTMLElement).style.cssText = `
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 2px 8px;
      font-family: monospace;
    `;
  });

  document.body.appendChild(overlay);
  helpOverlayVisible = true;
}

/**
 * Hide help overlay
 */
function hideHelpOverlay(): void {
  const overlay = document.getElementById('cra-keyboard-help');
  if (overlay) {
    overlay.remove();
    helpOverlayVisible = false;
  }
}

/**
 * Show go-to-file dialog
 */
function showGoToFileDialog(): void {
  if (goToFileVisible) return;

  const files = getFileHeaders();
  const fileNames = files.map(f => f.getAttribute('data-path') || f.textContent?.trim() || 'Unknown');

  const dialog = document.createElement('div');
  dialog.id = 'cra-goto-file';
  dialog.innerHTML = `
    <div class="cra-goto-content">
      <input type="text" id="cra-goto-input" placeholder="Type to filter files..." autocomplete="off">
      <ul id="cra-goto-list"></ul>
    </div>
  `;

  dialog.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10003;
    width: 500px;
    max-width: 90vw;
  `;

  const content = dialog.querySelector('.cra-goto-content') as HTMLElement;
  content.style.cssText = `
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    overflow: hidden;
  `;

  document.body.appendChild(dialog);
  goToFileVisible = true;

  const input = document.getElementById('cra-goto-input') as HTMLInputElement;
  const list = document.getElementById('cra-goto-list') as HTMLUListElement;

  input.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  `;

  list.style.cssText = `
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
  `;

  function renderList(filter: string = ''): void {
    list.innerHTML = '';
    const filtered = fileNames
      .map((name, idx) => ({ name, idx }))
      .filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));

    filtered.slice(0, 20).forEach((file, i) => {
      const li = document.createElement('li');
      li.textContent = file.name;
      li.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        ${i === 0 ? 'background: #f6f8fa;' : ''}
      `;
      li.addEventListener('click', () => {
        scrollToFile(file.idx);
        closeGoToFileDialog();
      });
      li.addEventListener('mouseenter', () => {
        li.style.background = '#f6f8fa';
      });
      li.addEventListener('mouseleave', () => {
        li.style.background = '';
      });
      list.appendChild(li);
    });
  }

  renderList();
  input.focus();

  input.addEventListener('input', () => renderList(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGoToFileDialog();
    } else if (e.key === 'Enter') {
      const firstItem = list.querySelector('li');
      if (firstItem) {
        (firstItem as HTMLElement).click();
      }
    }
  });
}

/**
 * Close go-to-file dialog
 */
function closeGoToFileDialog(): void {
  const dialog = document.getElementById('cra-goto-file');
  if (dialog) {
    dialog.remove();
    goToFileVisible = false;
  }
}

/**
 * Close all extension panels
 */
function closeAllPanels(): void {
  hideHelpOverlay();
  closeGoToFileDialog();

  // Close summary panel if open
  const summaryPanel = document.getElementById('cra-summary-panel');
  if (summaryPanel) {
    summaryPanel.style.display = 'none';
  }

  // Close any open tooltips
  document.querySelectorAll('.cra-tooltip').forEach(t => t.remove());
}

/**
 * Check if user is typing in an input field
 */
function isTypingInInput(): boolean {
  const active = document.activeElement;
  if (!active) return false;

  const tagName = active.tagName.toLowerCase();
  return tagName === 'input' ||
         tagName === 'textarea' ||
         (active as HTMLElement).isContentEditable;
}

/**
 * Parse key combination from event
 */
function getKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

/**
 * Main keyboard event handler
 */
function handleKeyDown(e: KeyboardEvent): void {
  // Don't intercept if typing in an input
  if (isTypingInInput() && e.key !== 'Escape') return;

  // If help overlay is visible, close it on any key
  if (helpOverlayVisible && e.key !== '?') {
    hideHelpOverlay();
    return;
  }

  const keyCombo = getKeyCombo(e);

  switch (keyCombo) {
    case 'j':
      e.preventDefault();
      scrollToFile(currentFileIndex + 1);
      break;
    case 'k':
      e.preventDefault();
      scrollToFile(currentFileIndex - 1);
      break;
    case 'n':
      e.preventDefault();
      scrollToIssue(currentIssueIndex + 1);
      break;
    case 'p':
      e.preventDefault();
      scrollToIssue(currentIssueIndex - 1);
      break;
    case 'ctrl+g':
      e.preventDefault();
      showGoToFileDialog();
      break;
    case 'escape':
      closeAllPanels();
      break;
    case 'shift+?':
    case '?':
      e.preventDefault();
      showHelpOverlay();
      break;
  }
}

/**
 * Initialize keyboard navigation
 */
export function initKeyboardNavigation(): void {
  document.addEventListener('keydown', handleKeyDown);
  console.log('[CRA] Keyboard navigation initialized. Press ? for help.');
}

/**
 * Cleanup keyboard navigation
 */
export function destroyKeyboardNavigation(): void {
  document.removeEventListener('keydown', handleKeyDown);
  closeAllPanels();
}
