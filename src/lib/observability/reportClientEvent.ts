/**
 * بیکن آنالیتیکس اختیاری first-party. تا وقتی `NEXT_PUBLIC_ANALYTICS_BEACON_URL`
 * ست نشده باشد هیچ vendorای لود نمی‌شود.
 */
export function reportClientEvent(
  name: string,
  payload: Record<string, string | number | boolean | undefined> = {}
): void {
  const url = process.env.NEXT_PUBLIC_ANALYTICS_BEACON_URL?.trim();
  if (!url || typeof window === 'undefined') return;

  const body = JSON.stringify({
    name,
    path: window.location.pathname,
    ...payload,
    timestamp: Date.now(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // اگر `sendBeacon` شکست خورد، `fetch`.
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
