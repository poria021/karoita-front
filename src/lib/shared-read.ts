/**
 * dedupe سمت کلاینت برای GETهایی که چند مصرف‌کنندهٔ غیر-react-query همزمان می‌زنند
 * (مثل `getEnrollmentPageState` که برای هر level جدا `open-course-selection`،
 * `by-semester`، `student-enrollments` و کاتالوگ دروس را می‌خواند).
 *
 * - درخواست در حال اجرا با همان کلید → همان Promise برگردانده می‌شود.
 * - نتیجهٔ موفق بعد از تمام شدن درخواست نگه داشته نمی‌شود (پیش‌فرض `ttlMs = 0`)؛ فقط درخواست در
 *   حال اجرا dedupe می‌شود. خطا هرگز cache نمی‌شود.
 * - بعد از هر نوشتن (ثبت‌نام/لغو/...) `invalidateSharedReads` صدا زده شود.
 */

type Entry = { promise: Promise<unknown>; settledAt: number | null; ttlMs: number };

const store = new Map<string, Entry>();

export const SHARED_READ_DEFAULT_TTL_MS = 0;

export function sharedRead<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = SHARED_READ_DEFAULT_TTL_MS
): Promise<T> {
  const hit = store.get(key);
  if (hit) {
    const fresh =
      hit.settledAt === null ||
      (hit.ttlMs > 0 && Date.now() - hit.settledAt <= hit.ttlMs);
    if (fresh) return hit.promise as Promise<T>;
    store.delete(key);
  }

  const entry: Entry = { promise: Promise.resolve(), settledAt: null, ttlMs };
  entry.promise = fn().then(
    (value) => {
      entry.settledAt = Date.now();
      return value;
    },
    (error: unknown) => {
      // شکست cache نشود؛ فقط اگر هنوز همین entry است حذفش کن.
      if (store.get(key) === entry) store.delete(key);
      throw error;
    }
  );
  store.set(key, entry);
  return entry.promise as Promise<T>;
}

/** بدون prefix همه را پاک می‌کند؛ با prefix فقط کلیدهایی که با آن شروع می‌شوند. */
export function invalidateSharedReads(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
