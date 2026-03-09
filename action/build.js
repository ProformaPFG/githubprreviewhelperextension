/**
 * Bundles action/index.js + all imported modules (analyzer, rules, @actions/*)
 * into a single CJS file at action/dist/index.js.
 *
 * GitHub Actions requires a single file entrypoint; bundling avoids needing
 * node_modules present at runtime.
 *
 * Run: node action/build.js
 */

import * as esbuild from 'esbuild';
import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outdir = resolve(__dirname, 'dist');

await mkdir(outdir, { recursive: true });

// Override "type": "module" from root package.json so Node treats the CJS bundle correctly.
await writeFile(resolve(outdir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');

const result = await esbuild.build({
  entryPoints: [resolve(__dirname, 'index.js')],
  bundle: true,
  outfile: resolve(outdir, 'index.js'),
  platform: 'node',
  target: 'node20',
  format: 'cjs',       // GitHub Actions runner expects CommonJS
  sourcemap: false,
  minify: false,        // keep readable for debugging action issues
  logLevel: 'info',
});

if (result.errors.length > 0) {
  console.error('Build failed:', result.errors);
  process.exit(1);
}

console.log('✅  Action bundle written to action/dist/index.js');
