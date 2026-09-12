/**
 * جلوگیری از دو کلاس باگی که در auth.service.ts و syllabus-config.service.ts پیدا شد:
 * ۱. re-export بدون گارد یک مقدار که از مسیر `mock/` ایمپورت شده — در پروداکشن
 *    توسط NormalModuleReplacementPlugin به stub تبدیل می‌شود (next.config.ts).
 * ۲. ایمپورت یک ثابت secret-شکل (OTP/Password/Token/...) که اسمش با MOCK_ شروع
 *    می‌شود از داخل پوشهٔ mock/ در فایلی بیرون از mock/ — این دقیقاً همان الگویی
 *    بود که گارد رد OTP mock در real mode را در پروداکشن بی‌اثر کرده بود.
 *
 * این اسکریپت AST-aware نیست — فقط این دو الگوی مشخص را می‌گیرد، نه هر نشتی
 * منطقی احتمالی (مثل استفاده از یک import مسیر-mock در یک شاخهٔ real بدون گارد
 * IS_MOCK_MODE). آن دسته باگ همچنان نیاز به review دستی دارد.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'src');

const MOCK_PATH_SEGMENT = /[\\/]mock[\\/]/;
const SECRET_NAME_RE = /^MOCK_[A-Z0-9_]*(CODE|PASSWORD|SECRET|TOKEN|KEY)$/;

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

function isMockOwnedFile(file) {
  return MOCK_PATH_SEGMENT.test(file) || file.includes('__mocks__');
}

function isTestFile(file) {
  return /\.(test|spec)\.(ts|tsx)$/.test(file);
}

function extractImportedNames(source) {
  // import { A, B as C } from '.../mock/...'  |  import D from '.../mock/...'
  const names = [];
  const importBlockRe =
    /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = importBlockRe.exec(source))) {
    const [, defaultName, namedList, specifier] = match;
    if (!MOCK_PATH_SEGMENT.test(specifier)) continue;
    if (defaultName) names.push(defaultName);
    if (namedList) {
      for (const part of namedList.split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        // "X as Y" -> local binding is Y, original export name is X (check both)
        const [original, alias] = trimmed.split(/\s+as\s+/).map((s) => s.trim());
        names.push(original);
        if (alias) names.push(alias);
      }
    }
  }
  return [...new Set(names)];
}

const violations = [];

for (const file of walk(TARGET)) {
  if (isMockOwnedFile(file) || isTestFile(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  const importedNames = extractImportedNames(source);
  if (importedNames.length === 0) continue;
  const rel = path.relative(ROOT, file).split(path.sep).join('/');

  for (const name of importedNames) {
    // قاعدهٔ ۱: re-export بی‌گارد — `export { name }` یا `export { ..., name, ... }`
    const reExportRe = new RegExp(
      `export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`
    );
    if (reExportRe.test(source)) {
      violations.push(
        `${rel}: re-exports "${name}" imported from a mock/ path — production build stubs it silently. Import the real value from a non-mock module instead.`
      );
    }

    // قاعدهٔ ۲: ثابت secret-شکل ایمپورت‌شده بیرون از mock/
    if (SECRET_NAME_RE.test(name)) {
      violations.push(
        `${rel}: imports secret-shaped constant "${name}" from a mock/ path — move it to a non-mock module (e.g. known-test-*.ts) so real-mode code doesn't depend on a stubbed value.`
      );
    }
  }
}

if (violations.length) {
  console.error('Mock/real leak detected:\n');
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('OK: no unguarded re-exports or secret-shaped imports from mock/ paths.');
