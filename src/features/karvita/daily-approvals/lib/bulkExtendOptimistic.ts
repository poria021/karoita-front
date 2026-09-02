import type { DailyApprovalCourseFilter, DailyApprovalTrainee } from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

/** پچ خوش‌بینانهٔ لیست برای تمدید/لغو گروهی در انتظار commit Facade. */
export function applyOptimisticBulkExtendWeeks(
  trainees: readonly DailyApprovalTrainee[],
  weekNumbers: readonly number[],
  revokeWeekNumbers: readonly number[],
  course?: DailyApprovalCourseFilter
): DailyApprovalTrainee[] {
  const extendSet = new Set(weekNumbers);
  const revokeSet = new Set(revokeWeekNumbers);

  return trainees.map((trainee) => {
    if (trainee.status === 'dropped') return trainee;
    if (course && course !== 'all' && trainee.courseKey !== course) {
      return trainee;
    }

    let changed = false;
    const weeks = trainee.weeks.map((week) => {
      if (week.status === 'graded') return week;

      if (revokeSet.has(week.weekNumber)) {
        if (week.status !== 'extended' && week.isExtended !== true) {
          return week;
        }
        changed = true;
        return {
          ...week,
          status: 'overdue' as const,
          isExtended: false,
        };
      }

      if (!extendSet.has(week.weekNumber)) return week;
      changed = true;
      return {
        ...week,
        status: 'extended' as const,
        isExtended: true,
        readBySupervisor: true,
      };
    });

    return changed ? { ...trainee, weeks } : trainee;
  });
}

export function buildBulkExtendUndoMessage(
  weekNumbers: readonly number[],
  revokeWeekNumbers: readonly number[]
): string {
  const formatWeeks = (numbers: readonly number[]) =>
    numbers.map((weekNumber) => toPersianDigits(weekNumber)).join('، ');

  const parts: string[] = [];
  if (weekNumbers.length > 0) {
    parts.push(`مهلت هفته‌های ${formatWeeks(weekNumbers)} تمدید شد`);
  }
  if (revokeWeekNumbers.length > 0) {
    parts.push(`تمدید هفته‌های ${formatWeeks(revokeWeekNumbers)} لغو شد`);
  }
  return parts.length > 0 ? `${parts.join(' و ')}.` : 'تمدید گروهی اعمال شد.';
}
