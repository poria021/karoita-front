/**
 * Fails if skeleton / cold-placeholder sources use undefined or banned kv bg tokens.
 * - Ban: `bg-kv-muted` (no such @theme color — use `bg-kv-border` / `bg-kv-surface-muted`).
 * - Any `bg-kv-*` in scoped files must exist as `--color-kv-*` in globals.css @theme.
 *
 * Run: node scripts/check-skeleton-tokens.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const GLOBALS = path.join(ROOT, 'src', 'app', 'globals.css');

const BANNED = new Set(['bg-kv-muted']);
const BG_KV_RE = /\bbg-kv-([a-z0-9-]+)\b/g;
const THEME_COLOR_RE = /--color-kv-([a-z0-9-]+)\s*:/g;

function walkDir(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walkDir(full, out);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function collectSkeletonFiles() {
  const files = [];
  walkDir(path.join(ROOT, 'src', 'components', 'shared', 'skeleton'), files);

  const uiSkeleton = path.join(ROOT, 'src', 'components', 'ui', 'skeleton.tsx');
  if (fs.existsSync(uiSkeleton)) files.push(uiSkeleton);

  const featuresRoot = path.join(ROOT, 'src', 'features');
  if (fs.existsSync(featuresRoot)) {
    for (const file of walkDir(featuresRoot)) {
      if (file.replace(/\\/g, '/').includes('/skeletons/')) {
        files.push(file);
      }
    }
  }
  return files;
}

function loadThemeKvColors() {
  const css = fs.readFileSync(GLOBALS, 'utf8');
  const colors = new Set();
  let match;
  while ((match = THEME_COLOR_RE.exec(css)) !== null) {
    colors.add(match[1]);
  }
  return colors;
}

const themeColors = loadThemeKvColors();
const files = collectSkeletonFiles();
const violations = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*')
    ) {
      return;
    }
    let match;
    BG_KV_RE.lastIndex = 0;
    while ((match = BG_KV_RE.exec(line)) !== null) {
      const full = `bg-kv-${match[1]}`;
      if (BANNED.has(full)) {
        violations.push(
          `${rel}:${index + 1}: banned ${full} (use bg-kv-border or a defined surface token)`
        );
        continue;
      }
      if (!themeColors.has(match[1])) {
        violations.push(
          `${rel}:${index + 1}: undefined theme token ${full} (no --color-kv-${match[1]} in globals.css)`
        );
      }
    }
  });
}

if (violations.length) {
  console.error('Invalid skeleton kv background tokens:\n');
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log(
  `OK: skeleton bg-kv-* tokens valid (${files.length} files, ${themeColors.size} theme colors).`
);
