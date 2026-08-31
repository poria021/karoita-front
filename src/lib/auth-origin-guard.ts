/**
 * محافظ CSRF برای Route Handlerهای state-changing احراز هویت.
 *
 * این Routeها فقط از کد same-origin خودمان فراخوانی می‌شوند
 * (مثلاً fetch('/api/auth/set-tokens') در real-auth.tokens.ts). یک سایت
 * متقاطع می‌تواند با fetch یا فرم، درخواست POST ارسال کند و چون cookieهای
 * sameSite=lax با ناوبری top-level همراهند، خطر CSRF روی این endpointها
 * واقعی است. چون این endpointها cookie httpOnly رفرش را می‌نویسند/پاک
 * می‌کنند، یک CSRF موفق می‌تواند session را ثابت-fix یا logout کند.
 *
 * راهکار استاندارد و سبک: رد کردن درخواست‌های cross-origin با بررسی
 * `Sec-Fetch-Site` (با fallback به `Origin` برای مرورگرهای قدیمی).
 * این بررسی هرگز فراخوانی‌های قانونی same-origin را نشکانده و به جاوااسکریپت
 * سمت کلاینت ما وابسته نیست.
 */

export interface OriginGuardRequest {
  url: string;
  headers: {
    get(name: string): string | null;
  };
}

export type OriginGuardResult =
  | { ok: true }
  | { ok: false; reason: string; status: number };

/**
 * درخواست POST را به‌عنوان same-origin تأیید می‌کند.
 * اولویت: `Sec-Fetch-Site` (مدرن) → `Origin` (fallback) → رد محتاطانه.
 */
export function assertSameOriginPost(
  request: OriginGuardRequest,
): OriginGuardResult {
  const fetchSite = request.headers.get('sec-fetch-site');

  if (fetchSite !== null) {
    // 'none' یعنی درخواست از همان صفحه (مثلاً devtools) — امن می‌دانیم.
    if (fetchSite === 'same-origin' || fetchSite === 'none') {
      return { ok: true };
    }
    return {
      ok: false,
      reason: 'درخواست از مبدأ متقاطع رد شد.',
      status: 403,
    };
  }

  // مرورگر بدون Sec-Fetch-Site: fallback به Origin.
  const origin = request.headers.get('origin');
  if (origin) {
    const requestOrigin = new URL(request.url).origin;
    if (origin === requestOrigin) {
      return { ok: true };
    }
    return {
      ok: false,
      reason: 'مبدأ درخواست با مبدأ برنامه همخوانی ندارد.',
      status: 403,
    };
  }

  // نه Sec-Fetch-Site و نه Origin — محتاطانه رد می‌کنیم تا مسیر دور زدن نباشد.
  return {
    ok: false,
    reason: 'هدر مبدأ درخواست قابل تشخیص نیست.',
    status: 403,
  };
}
