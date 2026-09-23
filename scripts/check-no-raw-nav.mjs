/**
 * رول ۰۰ §5: ناوبری داخلی فقط با `<Link>` یا `useRouter()`، نه `<a href="/...">`
 * خام یا `window.location.href` / `location.assign`. لینک خارجی با
 * `target="_blank"` مجاز است.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGETS = [
  path.join(ROOT, 'src', 'features'),
  path.join(ROOT, 'src', 'app'),
  path.join(ROOT, 'src', 'components'),
];

const RAW_ANCHOR_RE = /<a\s[^>]*href=["'`]\/(?!\/)/;
const EXTERNAL_MARKERS_RE = /target=["']_blank["']|rel=["'][^"']*noopener/;
const LOCATION_HREF_RE = /\b(window\.)?location\.href\s*=/;
const LOCATION_ASSIGN_RE = /\b(window\.)?location\.(assign|replace)\s*\(/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
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

function isTestFile(file) {
  return /\.(test|spec)\.(ts|tsx)$/.test(file);
}

const violations = [];

for (const target of TARGETS) {
  for (const file of walk(target)) {
    if (isTestFile(file)) continue;
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    const rel = path.relative(ROOT, file).split(path.sep).join('/');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

      if (RAW_ANCHOR_RE.test(line) && !EXTERNAL_MARKERS_RE.test(line)) {
        violations.push(
          `${rel}:${index + 1}: raw <a href="/..."> for internal nav — use next/link's <Link>: ${trimmed}`
        );
      }
      if (LOCATION_HREF_RE.test(line) || LOCATION_ASSIGN_RE.test(line)) {
        violations.push(
          `${rel}:${index + 1}: window.location for navigation — use useRouter()/RouteService: ${trimmed}`
        );
      }
    });
  }
}

if (violations.length) {
  console.error(
    'Raw internal navigation found (forbidden — use <Link> / useRouter()):\n'
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('OK: no raw <a href="/..."> or window.location navigation in src/features, src/app, src/components.');
