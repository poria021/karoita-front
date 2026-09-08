import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
      // Next.js server-only packages that do not exist in the vitest/jsdom runtime.
      // Tests that exercise code paths importing these modules need the stubs below;
      // actual behaviour is exercised by Next.js build and e2e tests.
      'server-only': path.resolve(root, './src/__mocks__/server-only.ts'),
      'next/headers': path.resolve(root, './src/__mocks__/next-headers.ts'),
    },
  },
});
