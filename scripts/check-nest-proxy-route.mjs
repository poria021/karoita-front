/**
 * بررسی وجود route handler پروکسی Nest.
 * بدون این route، تمام callهای `/api/nest` و `/__nest-api` (rewrite) به ۴۰۴ می‌خورند.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const routeFile = path.join(root, 'src', 'app', 'api', 'nest', '[...path]', 'route.ts');

if (!existsSync(routeFile)) {
  console.error(
    'FATAL: Missing src/app/api/nest/[...path]/route.ts\n' +
    'Without this route handler, all Nest API proxy calls (/api/nest/* and /__nest-api/*) ' +
    'will return a prerendered 404 HTML page instead of forwarding to the backend.\n' +
    'This was the root cause of the Darkube 404 bug — do not remove this file.'
  );
  process.exit(1);
}

const source = readFileSync(routeFile, 'utf8');

if (!source.includes('forwardToNestApi')) {
  console.error(
    'src/app/api/nest/[...path]/route.ts exists but does not call forwardToNestApi.\n' +
    'The route handler must forward requests to the Nest backend.'
  );
  process.exit(1);
}

const requiredMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const missing = requiredMethods.filter(
  (m) => !new RegExp(`export\\s+const\\s+${m}\\b`).test(source)
);
if (missing.length > 0) {
  console.error(
    `src/app/api/nest/[...path]/route.ts is missing exports: ${missing.join(', ')}.\n` +
    'All HTTP methods must be exported to proxy Nest correctly.'
  );
  process.exit(1);
}

if (!/force-dynamic/.test(source)) {
  console.error(
    'src/app/api/nest/[...path]/route.ts must set `export const dynamic = "force-dynamic"`.\n' +
    'Without this, Next.js may cache the route and return stale/prerendered responses.'
  );
  process.exit(1);
}

console.log('Nest proxy route OK (src/app/api/nest/[...path]/route.ts).');
