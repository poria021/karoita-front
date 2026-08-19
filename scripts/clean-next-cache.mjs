/**
 * Clears Next/Turbopack disk cache so long-lived `.next/dev` LSM growth
 * does not keep bloating subsequent `next dev` sessions.
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
