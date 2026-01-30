import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'options.html',
  'ui-styles.css',
];

// Copy individual files
filesToCopy.forEach(file => {
  const src = join(rootDir, file);
  const dest = join(distDir, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy icons directory
const iconsDir = join(rootDir, 'icons');
const distIconsDir = join(distDir, 'icons');

if (existsSync(iconsDir)) {
  if (!existsSync(distIconsDir)) {
    mkdirSync(distIconsDir, { recursive: true });
  }

  const icons = readdirSync(iconsDir);
  icons.forEach(icon => {
    const src = join(iconsDir, icon);
    const dest = join(distIconsDir, icon);
    if (statSync(src).isFile()) {
      copyFileSync(src, dest);
      console.log(`Copied: icons/${icon}`);
    }
  });
}

// Copy ui CSS if it exists
const uiCssDir = join(rootDir, 'ui');
const distUiDir = join(distDir, 'ui');

if (existsSync(uiCssDir)) {
  if (!existsSync(distUiDir)) {
    mkdirSync(distUiDir, { recursive: true });
  }

  const uiFiles = readdirSync(uiCssDir);
  uiFiles.forEach(file => {
    if (file.endsWith('.css')) {
      const src = join(uiCssDir, file);
      const dest = join(distUiDir, file);
      copyFileSync(src, dest);
      console.log(`Copied: ui/${file}`);
    }
  });
}

console.log('\nAssets copied successfully!');
