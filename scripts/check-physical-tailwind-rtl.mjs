/**
 * رول ۳۰ (RTL): کلاس‌های فیزیکی Tailwind (ml-/mr-/pl-/pr-/left-/right-/border-l(-)/
 * border-r(-)/rounded-l(-)/rounded-r(-)/rounded-t{l,r}-/rounded-b{l,r}-/text-left/
 * text-right) در RTL جهت را درست برنمی‌گردانند — باید logical properties
 * (ms-/me-/ps-/pe-/start-/end-/border-s(-)/border-e(-)/rounded-s(-)/rounded-e(-)/
 * text-start/text-end) استفاده شوند.
 *
 * heuristic است، نه parser کامل Tailwind — رشته‌های class را با regex می‌گیرد.
 * false-positive نادر (مثلاً یک کلاس دلخواه که تصادفاً با یکی از این پیشوندها
 * شروع می‌شود) را با کامنت `// physical-ok: <reason>` روی همان خط رد کن.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'src');
const SUPPRESS_COMMENT = 'physical-ok:';

const BOUNDARY = `(?:^|[\\s"'\`{])-?`;
const CLASS_TAIL = `[\\w./%\\[\\]]*`;

const PATTERNS = [
  { re: new RegExp(`${BOUNDARY}m[lr]-${CLASS_TAIL}`, 'g'), label: 'ml-/mr-' },
  { re: new RegExp(`${BOUNDARY}p[lr]-${CLASS_TAIL}`, 'g'), label: 'pl-/pr-' },
  { re: new RegExp(`${BOUNDARY}(?:left|right)-${CLASS_TAIL}`, 'g'), label: 'left-/right-' },
  { re: new RegExp(`${BOUNDARY}border-[lr](?:-${CLASS_TAIL})?\\b`, 'g'), label: 'border-l/border-r' },
  {
    re: new RegExp(
      `${BOUNDARY}rounded-(?:[lr]|t[lr]|b[lr])(?:-${CLASS_TAIL})?\\b`,
      'g'
    ),
    label: 'rounded-l/r/tl/tr/bl/br',
  },
  { re: new RegExp(`${BOUNDARY}text-(?:left|right)\\b`, 'g'), label: 'text-left/text-right' },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, out);
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const file of walk(TARGET)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const rel = path.relative(ROOT, file).split(path.sep).join('/');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (line.includes(SUPPRESS_COMMENT)) return;

    for (const { re, label } of PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line)) {
        violations.push(`${rel}:${index + 1} (${label}): ${trimmed}`);
      }
    }
  });
}

if (violations.length) {
  console.error(
    'Physical Tailwind directional classes found — use logical properties instead ' +
      '(ms-/me-, ps-/pe-, start-/end-, border-s-/border-e-, rounded-s-/rounded-e-, text-start/text-end).\n' +
      `Suppress a false positive with a same-line "// ${SUPPRESS_COMMENT} <reason>" comment.\n`
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('OK: no physical Tailwind directional classes found in src/.');
