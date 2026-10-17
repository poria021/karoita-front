/**
 * اجرای سرور جعلی Nest برای توسعهٔ محلی: `pnpm fake-api`.
 * متغیرها: `FAKE_NEST_PORT` (پیش‌فرض ۴۰۰۰)، `FAKE_NEST_PUBLIC_URL`،
 * `FAKE_NEST_STRICT=false`، `FAKE_NEST_DELAY_MS`،
 * `FAKE_NEST_TERM_LESSONS=original` (درس‌های ترم جدید از «تعریف دروس»؛ پیش‌فرض فهرست ثابت).
 */
import { createFakeNest } from './server';
import {
  SEED_ADMIN_PHONE,
  SEED_ASSISTANT_PHONE,
  SEED_MENTOR_PHONE,
  SEED_PASSWORD,
} from './seed';

const port = Number(process.env.FAKE_NEST_PORT) || 4000;
const fake = createFakeNest({
  port,
  publicUrl: process.env.FAKE_NEST_PUBLIC_URL,
  strict: process.env.FAKE_NEST_STRICT !== 'false',
  delayMs: Number(process.env.FAKE_NEST_DELAY_MS) || 0,
  termLessons: process.env.FAKE_NEST_TERM_LESSONS === 'original' ? 'original' : 'fixed',
});

void fake.listen().then((actualPort) => {
  console.info(`[fake-nest] روی http://localhost:${actualPort}/api بالا آمد`);
  console.info(`[fake-nest] ادمین: ${SEED_ADMIN_PHONE} / ${SEED_PASSWORD}`);
  console.info(`[fake-nest] دستیار مدیر ارشد: ${SEED_ASSISTANT_PHONE} / ${SEED_PASSWORD}`);
  console.info(`[fake-nest] استاد راهنما: ${SEED_MENTOR_PHONE} / ${SEED_PASSWORD}`);
});
