import { spawn } from 'node:child_process';

/**
 * بیلد production با webpack و `@next/bundle-analyzer` (`ANALYZE=true`)؛ Turbopack گزارش analyzer نمی‌دهد.
 */
const child = spawn('npx', ['next', 'build', '--webpack'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ANALYZE: 'true' },
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
