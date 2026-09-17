import type {
  DailyApprovalProgressiveGrade,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';

/**
 * مشتق نمرهٔ پیش‌رونده — مشترک store mock (و بعداً mapper Nest).
 * آستانه را caller تزریق می‌کند تا خواندن سرفصل اینجا نباشد.
 */
export function computeDailyApprovalProgressiveGrade(
  weeks: DailyApprovalWeek[],
  traineeStatus: DailyApprovalTrainee['status'],
  passingScoreThreshold: number
): DailyApprovalProgressiveGrade {
  if (traineeStatus === 'dropped') {
    return { gradedCount: 0, final20: null, statusLabel: 'حذف' };
  }
  const graded = weeks.filter(
    (week) => week.status === 'graded' && week.score !== null
  );
  if (graded.length === 0) {
    return { gradedCount: 0, final20: null, statusLabel: 'فاقد نمره' };
  }
  const avg100 =
    graded.reduce((sum, week) => sum + (week.score ?? 0), 0) / graded.length;
  const final20 = Number(((avg100 / 100) * 20).toFixed(2));
  return {
    gradedCount: graded.length,
    final20,
    statusLabel: avg100 >= passingScoreThreshold ? 'قبول' : 'مردود',
  };
}

export function deriveDailyApprovalTraineeFields(
  trainee: DailyApprovalTrainee,
  passingScoreThreshold: number
): Pick<
  DailyApprovalTrainee,
  'hasSubmitted' | 'unreadCount' | 'progressiveGrade'
> {
  const hasSubmitted = trainee.weeks.some(
    (week) =>
      week.status !== 'draft' &&
      week.status !== 'locked_future' &&
      week.status !== 'locked_dropped'
  );
  const unreadCount = trainee.weeks.filter(
    (week) =>
      week.status !== 'draft' &&
      week.status !== 'locked_future' &&
      week.status !== 'locked_dropped' &&
      week.status !== 'archived' &&
      !week.readBySupervisor
  ).length;
  const progressiveGrade = computeDailyApprovalProgressiveGrade(
    trainee.weeks,
    trainee.status,
    passingScoreThreshold
  );
  return {
    hasSubmitted,
    unreadCount,
    progressiveGrade:
      trainee.status === 'dropped'
        ? { ...progressiveGrade, statusLabel: 'حذف' }
        : hasSubmitted && progressiveGrade.gradedCount === 0
          ? { ...progressiveGrade, statusLabel: 'در جریان' }
          : progressiveGrade,
  };
}

export function withDerivedDailyApprovalTrainee(
  trainee: DailyApprovalTrainee,
  passingScoreThreshold: number
): DailyApprovalTrainee {
  return {
    ...trainee,
    ...deriveDailyApprovalTraineeFields(trainee, passingScoreThreshold),
  };
}
