/**
 * Routeهایی که کوکی httpOnly سشن را می‌نویسند/پاک می‌کنند باید گارد CSRF داشته باشند.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const authRoutes = [
  'src/app/api/auth/set-tokens/route.ts',
  'src/app/api/auth/clear-tokens/route.ts',
  'src/app/api/auth/refresh/route.ts',
];

const missing = [];
for (const rel of authRoutes) {
  const source = readFileSync(path.join(root, rel), 'utf8');
  if (!source.includes('assertSameOriginPost')) {
    missing.push(rel);
  }
}

if (missing.length > 0) {
  console.error(
    'Auth cookie routes must call assertSameOriginPost:\n' +
      missing.map((rel) => `  - ${rel}`).join('\n')
  );
  process.exit(1);
}

console.log('Auth origin guard OK (set-tokens, clear-tokens, refresh).');
