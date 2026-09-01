/**
 * کش دیسک Next/Turbopack را پاک می‌کند تا رشد LSM در `.next/dev` جلسه‌های بعدی `next dev` را باد نکند.
 */
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const targets = [
  join(root, '.next'),
  join(root, 'node_modules', '.cache'),
  join(root, '.npm-cache'),
];

for (const target of targets) {
  if (!existsSync(target)) continue;
  rmSync(target, { recursive: true, force: true });
  console.log(`Removed ${target}`);
}
