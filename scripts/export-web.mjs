// Builds the web version into dist/ with relative URLs, so the same files work at a
// domain root, under a GitHub Pages sub-path (/Aqua-Frog/), or from any static host.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'dist';
execSync(`npx expo export --platform web --output-dir ${out}`, { stdio: 'inherit' });

const relativize = (file, pairs) => {
  let text = readFileSync(file, 'utf8');
  for (const [from, to] of pairs) text = text.split(from).join(to);
  writeFileSync(file, text);
};

relativize(join(out, 'index.html'), [
  ['src="/_expo/', 'src="./_expo/'],
  ['href="/favicon.ico"', 'href="./favicon.ico"'],
]);

const jsDir = join(out, '_expo/static/js/web');
for (const f of readdirSync(jsDir).filter((f) => f.endsWith('.js'))) {
  // bundled asset URLs (fonts) are emitted as "/assets/..."; resolve them next to index.html
  relativize(join(jsDir, f), [['"/assets/', '"./assets/']]);
}

// GitHub Pages: serve files as-is and fall back to the app for unknown paths
writeFileSync(join(out, '.nojekyll'), '');
writeFileSync(join(out, '404.html'), readFileSync(join(out, 'index.html')));
console.log(`Web build ready in ${out}/`);
