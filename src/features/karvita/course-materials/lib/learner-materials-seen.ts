import type { CourseMaterial } from '@/types/course-materials';

/**
 * API فایل‌های درس (`mentor-lesson-files`) فیلد خوانده/جدید ندارد.
 * «جزوهٔ جدید» را سمت کلاینت با آخرین بازدید صندوق برای هر درس نگه می‌داریم.
 */
const STORAGE_PREFIX = 'kv:course-materials-seen:';

function storageKey(userId: string, courseKey: string): string {
  return `${STORAGE_PREFIX}${userId}:${courseKey}`;
}

export function readMaterialsSeenAt(
  userId: string,
  courseKey: string
): string | null {
  if (typeof window === 'undefined' || !userId || !courseKey) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(userId, courseKey));
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

export function writeMaterialsSeenAt(
  userId: string,
  courseKey: string,
  seenAtIso: string
): void {
  if (typeof window === 'undefined' || !userId || !courseKey) return;
  try {
    window.localStorage.setItem(storageKey(userId, courseKey), seenAtIso);
  } catch {
    // storage پر/مسدود — بج فقط برای این نشست از دست می‌رود.
  }
}

/** هر فایلی که بعد از آخرین بازدید صندوق آمده «جدید» است. */
export function countNewCourseMaterials(
  materials: readonly CourseMaterial[],
  seenAtIso: string | null
): number {
  if (materials.length === 0) return 0;
  if (!seenAtIso) return materials.length;
  return materials.filter((row) => row.createdAt > seenAtIso).length;
}

/** هنگام باز کردن صندوق، تا جدیدترین `createdAt` (یا الان) را دیده‌شده علامت بزن. */
export function markCourseMaterialsSeen(
  userId: string,
  courseKey: string,
  materials: readonly CourseMaterial[]
): void {
  const newest = materials.reduce<string | null>((max, row) => {
    if (!max || row.createdAt > max) return row.createdAt;
    return max;
  }, null);
  writeMaterialsSeenAt(userId, courseKey, newest ?? new Date().toISOString());
}
