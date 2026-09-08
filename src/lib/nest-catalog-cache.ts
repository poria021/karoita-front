/**
 * In-process cache for heavy, shared (non-user-specific) Nest GET endpoints.
 *
 * Why not Next.js data cache or unstable_cache?
 * → The proxy uses undici (not global fetch), so Next.js's extended fetch
 *   options (`next: { revalidate }`) are stripped before the upstream call.
 *   A process-level Map is simpler, zero-dependency, and correct for server
 *   deployments (cleared on restart; each serverless instance warms its own).
 *
 * What is safe to cache here?
 * → Only GET endpoints whose response is IDENTICAL for every authenticated
 *   user (catalog / geo / role / term data). The auth token gates access
 *   but does NOT change the payload. Never cache per-user paths.
 */

interface CatalogCacheEntry {
  body: string;
  contentType: string;
  status: number;
  cachedAt: number;
  ttlMs: number;
}

/** path‌هایی که باید cache شوند و مدت اعتبار هر کدام. */
const CACHEABLE: Array<{ test: RegExp; ttlMs: number }> = [
  // داده‌های جغرافیایی — تقریباً هرگز تغییر نمی‌کنند
  { test: /^admin\/province\/all$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/provinces(\?.*)?$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/cities(\?.*)?$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/educations(\?.*)?$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/schools\/all$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/schools(\?.*)?$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/universites(\?.*)?$/, ttlMs: 60 * 60_000 },
  // کاتالوگ مدرک / نقش — بار بالا، فقط با تغییر سیاست آموزشی عوض می‌شوند
  { test: /^admin\/degreeee(\?.*)?$/, ttlMs: 60 * 60_000 },
  { test: /^admin\/roles$/, ttlMs: 60 * 60_000 },
  { test: /^v1\/auth\/roles$/, ttlMs: 60 * 60_000 },
  // لیست نیم‌سال و درس — یک بار در ابتدای ترم آپدیت می‌شود
  { test: /^admin\/semester(\?.*)?$/, ttlMs: 30 * 60_000 },
  { test: /^admin\/semesters_all(\?.*)?$/, ttlMs: 30 * 60_000 },
  { test: /^admin\/settings(\?.*)?$/, ttlMs: 30 * 60_000 },
  // لیست اساتید یک درس — در دوره انتخاب‌واحد می‌تواند تغییر کند
  { test: /^v1\/student-enrollments\/professors(\?.*)?$/, ttlMs: 5 * 60_000 },
  // وضعیت باز/بسته‌بودن انتخاب‌واحد — باید سریع منعکس شود
  { test: /^v1\/student-enrollments\/open-course-selection(\?.*)?$/, ttlMs: 60_000 },
];

const _store = new Map<string, CatalogCacheEntry>();

/** آیا path قابل cache‌گذاری است؟ TTL برمی‌گرداند یا null. */
export function getCatalogCacheTtl(pathWithQuery: string): number | null {
  for (const { test, ttlMs } of CACHEABLE) {
    if (test.test(pathWithQuery)) return ttlMs;
  }
  return null;
}

export function getCatalogCache(
  cacheKey: string
): CatalogCacheEntry | null {
  const entry = _store.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > entry.ttlMs) {
    _store.delete(cacheKey);
    return null;
  }
  return entry;
}

export function setCatalogCache(
  cacheKey: string,
  entry: Omit<CatalogCacheEntry, 'cachedAt'>
): void {
  _store.set(cacheKey, { ...entry, cachedAt: Date.now() });
}

/** فقط برای تست‌ها. */
export function _clearCatalogCache(): void {
  _store.clear();
}
