import { spawn } from 'node:child_process';

/**
 * Webpack production build + @next/bundle-analyzer (ANALYZE=true).
 * Turbopack does not emit the analyzer report.
 */
const child = spawn('npx', ['next', 'build', '--webpack'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ANALYZE: 'true' },
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
