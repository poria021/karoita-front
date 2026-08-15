import type { DailyApprovalTrainee } from '@/types/daily-approvals';

/**
 * Week numbers that already appear as extended on any active trainee
 * in the current list snapshot (for bulk-extend modal pre-selection).
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
