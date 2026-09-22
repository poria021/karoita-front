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

/** آیا فراگیر حداقل یک هفته را از حالت پیش‌نویس/قفل خارج کرده — مشترک مسیر mock و real. */
export function computeHasSubmitted(weeks: DailyApprovalWeek[]): boolean {
  return weeks.some(
    (week) =>
      week.status !== 'draft' &&
      week.status !== 'locked_future' &&
      week.status !== 'locked_dropped'
  );
}

/**
 * نمرهٔ پیش‌رونده از روی `score-summary` بک‌اند (همان endpoint‌ای که داشبورد
 * دانشجو استفاده می‌کند) — برای مسیر real، به‌جای میانگین‌گیری سمت کلاینت روی
 * هفته‌ها (`computeDailyApprovalProgressiveGrade`)، تا نمرهٔ استاد و دانشجو
 * یک منبع محاسبه داشته باشند. نمرهٔ نهایی مستقیماً از `weightedScore` بک‌اند
 * خوانده می‌شود — هیچ محاسبه‌ای (تقسیم بر maximumScore و غیره) سمت کلاینت
 * انجام نمی‌شود.
 */
export function buildDailyApprovalProgressiveGradeFromSummary(
  summary: { scoredWeeks: number; weightedScore: number } | null,
  traineeStatus: DailyApprovalTrainee['status'],
  passingScoreThreshold: number
): DailyApprovalProgressiveGrade {
  if (traineeStatus === 'dropped') {
    return { gradedCount: 0, final20: null, statusLabel: 'حذف' };
  }
  if (!summary || summary.scoredWeeks <= 0) {
    return { gradedCount: summary?.scoredWeeks ?? 0, final20: null, statusLabel: 'فاقد نمره' };
  }
  const final20 = summary.weightedScore;
  const thresholdOn20 = (passingScoreThreshold / 100) * 20;
  return {
    gradedCount: summary.scoredWeeks,
    final20,
    statusLabel: final20 >= thresholdOn20 ? 'قبول' : 'مردود',
  };
}

export function deriveDailyApprovalTraineeFields(
  trainee: DailyApprovalTrainee,
  passingScoreThreshold: number
): Pick<
  DailyApprovalTrainee,
  'hasSubmitted' | 'unreadCount' | 'progressiveGrade'
> {
  const hasSubmitted = computeHasSubmitted(trainee.weeks);
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
