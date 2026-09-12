/**
 * رول ۰۰ §2: این ریپو صرفاً یک frontend مصرف‌کنندهٔ Nest API است — هیچ
 * ORM/DB داخلی (Drizzle/Prisma/pg/mysql2/knex/sequelize) و فایل `.sql` /
 * `schema.prisma` نباید زیر `src/` یا در `package.json` وجود داشته باشد.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'src');

const FORBIDDEN_PACKAGES = [
  'drizzle-orm',
  'drizzle-kit',
  '@prisma/client',
  'prisma',
  'pg',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  'knex',
  'sequelize',
  'typeorm',
  'mongoose',
];

const IMPORT_RE = new RegExp(
  `from\\s*['"](${FORBIDDEN_PACKAGES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?:/|['"])`
);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const file of walk(TARGET)) {
  if (/\.(ts|tsx|js|mjs)$/.test(file)) {
    const source = fs.readFileSync(file, 'utf8');
    if (IMPORT_RE.test(source)) {
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      violations.push(`${rel}: imports a DB/ORM package — this repo has no in-repo database.`);
    }
  }
  if (/\.sql$/.test(file) || path.basename(file) === 'schema.prisma') {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    violations.push(`${rel}: DB schema/migration file found under src/ — forbidden (Nest owns the database).`);
  }
}

const pkgPath = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const foundDeps = FORBIDDEN_PACKAGES.filter((name) => name in allDeps);
  if (foundDeps.length) {
    violations.push(
      `package.json: forbidden DB/ORM dependency present: ${foundDeps.join(', ')}.`
    );
  }
}

if (violations.length) {
  console.error('DB/ORM usage found in a pure-frontend repo:\n');
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('OK: no in-repo DB/ORM imports, schema files, or dependencies found.');
