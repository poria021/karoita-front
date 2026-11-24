import { defineConfig, devices } from '@playwright/test';

/**
 * اسموک نازک حالت mock (فقط خانوادهٔ Chromium).
 *
 * ترجیح با Google Chrome سیستم (`channel: 'chrome'`) است — CDN پلی‌رایت در برخی
 * مناطق geo-block است. اختیاری: `npm run test:e2e:install`.
 *
 * باید `next dev` باشد (نه `next start`): پروداکشن `NEXT_PUBLIC_API_MODE=mock` را
 * ممنوع می‌کند. `webServer.reuseExistingServer` پایین عمداً `false` است: اگر `next
 * dev` دیگری روی همان پورت باشد، پلی‌رایت بلند fail می‌شود به‌جای reuse بی‌صدا —
 * که قبلاً با env/session موجود OTP/ورود mock را غیرقطعی خراب می‌کرد.
 *
 * `PLAYWRIGHT_PORT` (پیش‌فرض ۳۰۰۰؛ در pre-push معمولاً ۳۱۰۰) تا با `next dev`
 * دستی روی ۳۰۰۰ تداخل نکند.
 */
const e2ePort = process.env.PLAYWRIGHT_PORT?.trim() || '3000';
const e2eOrigin = `http://127.0.0.1:${e2ePort}`;

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
    baseURL: e2eOrigin,
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
    command: `npm run dev -- --hostname 127.0.0.1 --port ${e2ePort}`,
    url: e2eOrigin,
    // هرگز `next dev` در حال اجرا را reuse نکنید: سرور سرگردان (مثلاً دستی با
    // `NEXT_PUBLIC_API_MODE=real` از `.env.local`، یا کوکی نشست باقی‌مانده) اسموک
    // mock را بی‌صدا خراب می‌کند — جریان OTP/ورود به کاربرهای `MOCK_*` وابسته است
    // که فقط در mock وجود دارند. همیشه سرور جدا با env اجباری پایین بالا بیاید،
    // حتی locally. نگاه کنید به README «E2E smoke (mock only)».
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_MODE: 'mock',
    },
  },
});
