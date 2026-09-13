/**
 * `GET /student-enrollments/professors` فقط استادانی را می‌دهد که «هنوز ظرفیت
 * خالی دارند» — بعد از ثبت‌نام، همان استاد ممکن است از این لیست خارج شود (ظرفیتش
 * پر شده) و دیگر قابل جست‌وجو نیست. Nest جای دیگری نام استاد را برنمی‌گرداند
 * (`professorId` روی enrollment همیشه رشتهٔ خام است، نه populated).
 * پس نام را همان لحظه‌ای که کاربر از لیست انتخاب می‌کند (وقتی هنوز در دسترس است)
 * محلی کش می‌کنیم تا صفحات بعدی (S4/S5) بتوانند بدون نیاز به آن query دوباره نمایشش بدهند.
 */
const STORAGE_KEY = 'karvita_supervisor_name_cache_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readCache(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function cacheSupervisorName(professorId: string, name: string): void {
  const id = professorId.trim();
  const trimmedName = name.trim();
  if (!id || !trimmedName || !isBrowser()) return;
  try {
    const cache = readCache();
    cache[id] = trimmedName;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // کش صرفاً بهبود تجربه است — شکستنش نباید فلوی اصلی را بترکاند.
  }
}

export function getCachedSupervisorName(professorId: string): string | null {
  const id = professorId.trim();
  if (!id) return null;
  const cache = readCache();
  return cache[id]?.trim() || null;
}
