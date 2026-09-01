/**
 * کمک‌تابع خالص برای chrome ماژول داشبورد که در query string مرورگر آینه می‌شود.
 * متن جست‌وجو و offset لیست بی‌نهایت را در URL نگذارید (تراکم SPA/PWA).
 */

export function pickAllowedSearchParam<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  if (raw != null && (allowed as readonly string[]).includes(raw)) {
    return raw as T;
  }
  return fallback;
}

/** pathname + search؛ `value: null` کلید را حذف می‌کند. search خالی → فقط pathname. */
export function hrefWithSearchParam(
  pathname: string,
  current: URLSearchParams | { toString(): string },
  key: string,
  value: string | null
): string {
  const params = new URLSearchParams(current.toString());
  if (value == null || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function appendSearchParam(
  path: string,
  key: string,
  value: string
): string {
  const hashIndex = path.indexOf('#');
  const beforeHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const qIndex = beforeHash.indexOf('?');
  const pathname = qIndex >= 0 ? beforeHash.slice(0, qIndex) : beforeHash;
  const existing = qIndex >= 0 ? beforeHash.slice(qIndex + 1) : '';
  const params = new URLSearchParams(existing);
  params.set(key, value);
  const qs = params.toString();
  return `${pathname}?${qs}${hash}`;
}
