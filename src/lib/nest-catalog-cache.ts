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

/**
 * وقتی mutation روی sub-resource می‌رود (مثل PATCH admin/semester/{id})
 * باید list مربوطه (admin/semester) هم پاک شود.
 * این قوانین cascade را مشخص می‌کنند: path mutate‌شده → path‌هایی که باید invalidate شوند.
 *
 * الگوهای CACHEABLE فقط مسیر برهنهٔ لیست را match می‌کنند (`admin/educations`).
 * PATCH/PUT/DELETE هر entity تکی روی `admin/educations/{id}` می‌رود که match نمی‌شود —
 * بدون این cascade، لیست تا انقضای TTL (تا ۱ ساعت) کش stale برمی‌گرداند و ویرایش/حذف
 * در UI «اثر نمی‌کند» تا mutation بعدی روی مسیر برهنه (مثلاً create) کش را پاک کند.
 */
const MUTATION_CASCADE: Array<{ test: RegExp; also: string[] }> = [
  // PATCH/DELETE روی یک ترم → list ترم‌ها + bundle درس‌ها
  {
    test: /^admin\/semester\/.+/,
    also: ['admin/semester', 'admin/semesters_all'],
  },
  // PATCH وضعیت/ظرفیت/روز درس → bundle درس‌ها
  {
    test: /^admin\/lessons\//,
    also: ['admin/semesters_all'],
  },
  // PATCH/DELETE هفته → bundle درس‌ها
  {
    test: /^admin\/weeks\//,
    also: ['admin/semesters_all'],
  },
  // PATCH/DELETE استان تکی → لیست‌های استان
  {
    test: /^admin\/provinces\/.+/,
    also: ['admin/provinces', 'admin/province/all'],
  },
  // PATCH/DELETE شهر تکی → لیست شهر
  {
    test: /^admin\/cities\/.+/,
    also: ['admin/cities'],
  },
  // PATCH/DELETE منطقهٔ آموزشی تکی → لیست مناطق
  {
    test: /^admin\/educations\/.+/,
    also: ['admin/educations'],
  },
  // PUT مدرسه با `/` قبل از id؛ DELETE بدون `/` (`admin/schools{id}` — ببین schoolDeleteById).
  {
    test: /^admin\/schools\/.+/,
    also: ['admin/schools', 'admin/schools/all'],
  },
  {
    test: /^admin\/schools[^/]+$/,
    also: ['admin/schools', 'admin/schools/all'],
  },
  // PATCH/DELETE پردیس تکی → لیست پردیس
  {
    test: /^admin\/universites\/.+/,
    also: ['admin/universites'],
  },
  // PUT/DELETE رشته نوشتنش `admin/degree/{id}` است؛ لیست کش‌شده `admin/degreeee` (۴ تا e، مسیر متفاوت).
  {
    test: /^admin\/degree\/.+/,
    also: ['admin/degreeee'],
  },
];

/**
 * پس از موفقیت mutation، cache مربوطه را پاک می‌کند.
 * علاوه بر exact match، sub-resource های ترم/درس/هفته نیز list parent را invalidate می‌کنند.
 */
export function invalidateCatalogCacheByPath(path: string): void {
  // ۱. exact match (رفتار قبلی)
  for (const key of _store.keys()) {
    const keyPath = key.split('?')[0];
    if (keyPath === path) _store.delete(key);
  }
  // ۲. cascade: path‌هایی که باید به‌خاطر این mutation پاک شوند
  for (const { test, also } of MUTATION_CASCADE) {
    if (!test.test(path)) continue;
    for (const target of also) {
      for (const key of _store.keys()) {
        if (key.split('?')[0] === target) _store.delete(key);
      }
    }
  }
}

/**
 * آیا این mutation باید cache را باطل کند؟
 * علاوه بر exact cacheable path، sub-resource‌هایی که cascade rule دارند هم true برمی‌گردانند.
 */
export function isMutationCacheRelated(path: string): boolean {
  if (getCatalogCacheTtl(path) !== null) return true;
  return MUTATION_CASCADE.some(({ test }) => test.test(path));
}

/** فقط برای تست‌ها. */
export function _clearCatalogCache(): void {
  _store.clear();
}
