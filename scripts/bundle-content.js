import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

await esbuild.build({
  entryPoints: [join(distDir, 'content.js')],
  bundle: true,
  outfile: join(distDir, 'content.js'),
  platform: 'browser',
  target: ['chrome120'],
  format: 'iife',
  allowOverwrite: true,
});

console.log('Content script bundled successfully!');
