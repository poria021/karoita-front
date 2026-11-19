import type { LessonPendingReview } from '@/services/reports/real/lesson-reports.api';

/**
 * کارت‌های «در انتظار بررسی» را با فهرست همهٔ دروس ادغام می‌کند تا درسی که هیچ گزارش
 * در انتظاری ندارد هم با عدد ۰ نمایش داده شود (API فقط درس‌های دارای مورد را برمی‌گرداند).
 *
 * - ترتیب: همان ترتیب `courseTitles`؛ بعد کارت‌های API که در فهرست دروس نبودند.
 * - تطبیق بر اساس عنوانِ trim‌شده؛ عنوان تکراری یک بار می‌آید.
 */
export function mergePendingWithCourses(
  pending: readonly LessonPendingReview[],
  courseTitles: readonly string[]
): LessonPendingReview[] {
  const counts = new Map<string, number>();
  for (const card of pending) {
    const title = card.title.trim();
    if (!title) continue;
    counts.set(title, (counts.get(title) ?? 0) + card.pendingCount);
  }

  const merged: LessonPendingReview[] = [];
  const seen = new Set<string>();
  const push = (rawTitle: string) => {
    const title = rawTitle.trim();
    if (!title || seen.has(title)) return;
    seen.add(title);
    merged.push({ title, pendingCount: counts.get(title) ?? 0 });
  };

  courseTitles.forEach(push);
  pending.forEach((card) => push(card.title));
  return merged;
}
