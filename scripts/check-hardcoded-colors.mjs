/**
 * اگر `src/**/*.{ts,tsx}` رنگ هاردکد (`#hex` / `rgb()` / `hsl()`) داشته باشد fail کن.
 * توکن‌ها در `globals.css`؛ برای مثبت کاذب همان `eslint-disable-line no-restricted-syntax`.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'src');
const ALLOW_FILES = new Set([
  // Manifest / theme-color نمی‌تواند از کلاس Tailwind استفاده کند.
  'lib/pwa/pwa-chrome-color.ts',
]);

const COLOR_RE =
  /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/i;
const SUPPRESS_RE = /eslint-disable(?:-next)?-line\s+no-restricted-syntax/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, out);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (ALLOW_FILES.has(rel)) continue;

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      return;
    }
    if (!COLOR_RE.test(line)) return;
    if (SUPPRESS_RE.test(line)) return;
    if (index > 0 && SUPPRESS_RE.test(lines[index - 1])) return;
    violations.push(`${rel}:${index + 1}: ${trimmed.slice(0, 120)}`);
  });
}

if (violations.length) {
  console.error(
    'Hardcoded colors found. Define HSL --kv-* tokens in globals.css and use kv-* utilities.\n'
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('OK: no hardcoded #hex / rgb() / hsl() in src/**/*.{ts,tsx} (except allowed brand icons).');
