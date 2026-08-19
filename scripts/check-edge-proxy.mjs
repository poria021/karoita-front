/**
 * Next.js 16: Edge session gate lives in src/proxy.ts (PROXY_FILENAME).
 * A root/src middleware.ts is deprecated and conflicts with proxy.ts.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbidden = [
  'middleware.ts',
  'middleware.js',
  'src/middleware.ts',
  'src/middleware.js',
];
const proxyFile = path.join(root, 'src', 'proxy.ts');

const foundForbidden = forbidden.filter((rel) => existsSync(path.join(root, rel)));
if (foundForbidden.length > 0) {
  console.error(
    `Forbidden Edge file(s): ${foundForbidden.join(', ')}.\n` +
      'Next.js 16 uses src/proxy.ts only. Having both middleware and proxy fails the build.\n' +
      'See https://nextjs.org/docs/messages/middleware-to-proxy'
  );
  process.exit(1);
}

if (!existsSync(proxyFile)) {
  console.error('Missing src/proxy.ts — Edge session gate would not run.');
  process.exit(1);
}

const source = readFileSync(proxyFile, 'utf8');
if (!/export\s+async\s+function\s+proxy\b/.test(source) && !/export\s+function\s+proxy\b/.test(source)) {
  console.error('src/proxy.ts must export a named function `proxy`. Matcher/config is ignored otherwise.');
  process.exit(1);
}
if (!/export\s+const\s+config\b/.test(source) || !/matcher\s*:/.test(source)) {
  console.error('src/proxy.ts must export `config.matcher` in the same file (static extraction).');
  process.exit(1);
}

console.log('Edge proxy convention OK (src/proxy.ts).');
