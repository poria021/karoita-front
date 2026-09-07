/**
 * تشخیص و مدیریت ChunkLoadError در Next.js
 *
 * چرا این مشکل پیش میاد:
 *  بعد از هر deploy جدید، hash فایل‌های JS عوض میشه.
 *  کاربری که تب مرورگرش باز بوده، هنوز به chunk های قدیمی اشاره می‌کنه.
 *  وقتی navigate می‌کنه، اون chunk ها روی سرور وجود ندارن → ChunkLoadError.
 *
 * راه‌حل:
 *  یک بار صفحه رو reload کن تا chunk های جدید لود بشن.
 *  اگر reload هم کمک نکرد (مثلاً آفلاین یا خطای واقعی)، اجازه بده خطا نمایش پیدا کنه.
 */

const STORAGE_KEY = 'kv_chunk_reload_at';
const COOLDOWN_MS = 15_000; // 15 ثانیه — جلوگیری از infinite reload loop

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  );
}

/**
 * یک بار reload می‌کنه و true برمی‌گردونه.
 * اگر در بازه cooldown باشیم (یعنی قبلاً reload شده)، false برمی‌گردونه تا خطا نمایش داده بشه.
 */
export function tryReloadForChunkError(): boolean {
  try {
    const last = sessionStorage.getItem(STORAGE_KEY);
    if (last && Date.now() - Number(last) < COOLDOWN_MS) {
      return false;
    }
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // sessionStorage ممکنه در private mode در دسترس نباشه
  }
  window.location.reload();
  return true;
}
