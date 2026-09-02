/**
 * گارد CSRF برای Routeهای تغییر سشن: فقط same-origin.
 * `sameSite=lax` با ناوبری top-level کوکی را می‌فرستد؛ بدون این چک CSRF می‌تواند session را fix/rotate/logout کند.
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

/** POST same-origin: `Sec-Fetch-Site` سپس `Origin`؛ بدون هر دو، رد محتاطانه. */
export function assertSameOriginPost(
  request: OriginGuardRequest,
): OriginGuardResult {
  const fetchSite = request.headers.get('sec-fetch-site');

  if (fetchSite !== null) {
    // `none` یعنی همان صفحه (مثلاً devtools) — امن.
    if (fetchSite === 'same-origin' || fetchSite === 'none') {
      return { ok: true };
    }
    return {
      ok: false,
      reason: 'درخواست از مبدأ متقاطع رد شد.',
      status: 403,
    };
  }

  // مرورگر بدون `Sec-Fetch-Site`: fallback به `Origin`.
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

  // هیچ هدر مبدأ نیست — رد تا مسیر دور زدن نباشد.
  return {
    ok: false,
    reason: 'هدر مبدأ درخواست قابل تشخیص نیست.',
    status: 403,
  };
}
