import { defineConfig, devices } from '@playwright/test';

/**
 * اسموک نازک حالت mock (فقط خانوادهٔ Chromium).
 *
 * ترجیح با Google Chrome سیستم (`channel: 'chrome'`) است — CDN پلی‌رایت در برخی
 * مناطق geo-block است. اختیاری: `npm run test:e2e:install`.
 *
 * باید `next dev` باشد (نه `next start`): پروداکشن `NEXT_PUBLIC_API_MODE=mock` را
 * ممنوع می‌کند. `webServer.reuseExistingServer` پایین عمداً `false` است: اگر `next
 * dev` دیگری روی :3000 باشد (Next ۱۶ فقط یک اینستنس در هر پوشهٔ پروژه)، پلی‌رایت
 * با تداخل پورت بلند fail می‌شود به‌جای اینکه بی‌صدا همان سرور را reuse کند —
 * که قبلاً با هر env/session موجود (اغلب real از `.env.local`) OTP/ورود mock را
 * غیرقطعی خراب می‌کرد. اول `next dev` دیگر را ببندید.
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
