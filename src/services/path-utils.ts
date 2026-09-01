/**
 * هلپر خالص رشتهٔ مسیر — بدون کاتالوگ مسیر و بدون نوع کاربر.
 * در Edge و تست بدون side-effect قابل استفاده است.
 */

export function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

export function parentPathname(pathname: string): string {
  const path = normalizePathname(pathname);
  if (path === '/') return '/';
  const slash = path.lastIndexOf('/');
  return slash <= 0 ? '/' : path.slice(0, slash);
}

export function pathSegments(pathname: string): string[] {
  return normalizePathname(pathname).split('/').filter(Boolean);
}

export function leafSegment(pathname: string): string {
  const segs = pathSegments(pathname);
  return segs[segs.length - 1] ?? '';
}

/** تعداد سگمنت مشترک ابتدای دو مسیر. */
export function commonPrefixSegmentCount(a: string, b: string): number {
  const left = pathSegments(a);
  const right = pathSegments(b);
  let i = 0;
  while (i < left.length && i < right.length && left[i] === right[i]) {
    i += 1;
  }
  return i;
}

/** Levenshtein فقط برای سگمنت/مسیر کوتاه. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) {
      prev[j] = curr[j] ?? 0;
    }
  }

  return prev[b.length] ?? b.length;
}
