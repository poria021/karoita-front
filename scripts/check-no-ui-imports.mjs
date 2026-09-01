/**
 * اگر `features` یا `app` مستقیم `ui/table` یا `ui/skeleton` بگیرند fail کن.
 * اتم‌های button/badge/spinner مجازند؛ جدول/اسکلتون فقط از طریق `KvTable` / `KvBusySurface`.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGETS = [
  path.join(ROOT, 'src', 'features'),
  path.join(ROOT, 'src', 'app'),
];

const FORBIDDEN_RE =
  /from\s+['"]@\/components\/ui\/(?:table|skeleton)(?:\/[^'"]*)?['"]|require\(\s*['"]@\/components\/ui\/(?:table|skeleton)(?:\/[^'"]*)?['"]\s*\)/;

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

const violations = [];

for (const target of TARGETS) {
  for (const file of walk(target)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      if (FORBIDDEN_RE.test(line)) {
        violations.push(
          `${path.relative(ROOT, file).split(path.sep).join('/')}:${index + 1}: ${trimmed}`
        );
      }
    });
  }
}

if (violations.length) {
  console.error(
    'Forbidden product-bypass @/components/ui imports in features/app (use shared KvTable / KvBusySurface):\n'
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log(
  'OK: no forbidden ui/table or ui/skeleton imports in src/features or src/app.'
);
