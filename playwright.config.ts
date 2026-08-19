import { defineConfig, devices } from '@playwright/test';

/**
 * Thin mock-mode smoke (Chromium-family only).
 *
 * Prefers system Google Chrome (`channel: 'chrome'`) — Playwright’s CDN is
 * geo-blocked in some regions. Optional: `npm run test:e2e:install`.
 *
 * Must use `next dev` (not `next start`): production forbids
 * `NEXT_PUBLIC_API_MODE=mock`. Stop any other `next dev` for this app first
 * (Next 16 allows only one per project dir).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 90_000,
  expect: {
    timeout: 20_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_MODE: 'mock',
    },
  },
});
