import type { NestMentorCapacity } from '@/types/nest-student-enrollments';
import type { OrganizationalCapacitiesSnapshot } from '@/types/organizational-capacities';

export type CapacitySummary = OrganizationalCapacitiesSnapshot['summary'];

function finiteCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

/**
 * پاسخ `GET /student-enrollments/mentor/capacity?semesterId=` → کارت‌های خلاصه:
 *   کل ظرفیت اعلام‌شده ← allTeacherCapacity
 *   پذیرش قطعی        ← selected (لغوشده‌ها حساب نمی‌شوند)
 *   باقی‌مانده         ← remain (= allTeacherCapacity - selected)
 * اگر allTeacherCapacity نیامده باشد `null` برمی‌گرداند تا UI به خلاصهٔ محلی برگردد.
 */
export function mentorCapacityToSummary(
  raw: NestMentorCapacity | null | undefined
): CapacitySummary | null {
  const total = finiteCount(raw?.allTeacherCapacity);
  if (total === null) return null;
  const confirmed = finiteCount(raw?.selected) ?? 0;
  const remaining = finiteCount(raw?.remain) ?? Math.max(0, total - confirmed);
  return { total, confirmed, remaining };
}
