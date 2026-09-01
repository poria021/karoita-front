import type { DailyApprovalTrainee } from '@/types/daily-approvals';

/**
 * شماره هفته‌هایی که در اسنپ‌شات فعلی برای کارآموز فعال تمدید شده‌اند
 * (پیش‌انتخاب مودال تمدید گروهی).
 */
export function collectExtendedWeekNumbers(
  trainees: readonly DailyApprovalTrainee[]
): number[] {
  const weekNumbers = new Set<number>();
  for (const trainee of trainees) {
    if (trainee.status === 'dropped') continue;
    for (const week of trainee.weeks) {
      if (week.status === 'extended' || week.isExtended === true) {
        weekNumbers.add(week.weekNumber);
      }
    }
  }
  return [...weekNumbers].sort((left, right) => left - right);
}
