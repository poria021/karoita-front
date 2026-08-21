import { defineConfig, devices } from '@playwright/test';

/**
 * Thin mock-mode smoke (Chromium-family only).
 *
 * Prefers system Google Chrome (`channel: 'chrome'`) — Playwright’s CDN is
 * geo-blocked in some regions. Optional: `npm run test:e2e:install`.
 *
 * Must use `next dev` (not `next start`): production forbids
 * `NEXT_PUBLIC_API_MODE=mock`. `webServer.reuseExistingServer` below is
 * hardcoded `false` on purpose: if another `next dev` for this app is
 * already running on :3000 (Next 16 allows only one per project dir),
 * Playwright will now fail loudly on port conflict instead of silently
 * reusing that server — which previously ran with whatever env/session it
 * already had (often real mode from `.env.local`) and broke mock-only
 * OTP/login flows non-deterministically. Stop the other `next dev` first.
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
    // NEVER reuse an already-running `next dev`: a stray server (e.g. one
    // started manually with `.env.local`'s NEXT_PUBLIC_API_MODE=real, or
    // carrying a leftover auth cookie) silently breaks mock-only smoke tests
    // — OTP/login flows depend on MOCK_* seed users that only exist in mock
    // mode. Always spawn a dedicated server bound to the forced env below,
    // even locally. See README "E2E smoke (mock only)".
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_MODE: 'mock',
    },
  },
});
