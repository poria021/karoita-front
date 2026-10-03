import { deriveDailyApprovalTraineeFields } from '@/services/daily-approvals/daily-approval-derived';
import type { UserRole } from '@/types/auth';
import type {
  DailyApprovalForwardTarget,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';

/** نقشی که فقط گزارش ارجاع‌شده را می‌بیند → مقصد ارجاع متناظر. */
const TARGET_BY_ROLE: Partial<Record<UserRole, DailyApprovalForwardTarget>> = {
  mentor_teacher: 'mentor',
  school_principal: 'principal',
};

export const FORWARD_TARGET_LABEL: Record<DailyApprovalForwardTarget, string> = {
  mentor: 'معلم راهنما',
  principal: 'مدیر مدرسه',
};

export function forwardTargetForRole(
  role: UserRole | null | undefined
): DailyApprovalForwardTarget | null {
  return (role && TARGET_BY_ROLE[role]) || null;
}

const HIDDEN_BEFORE_FORWARD = new Set<DailyApprovalWeek['status']>([
  'draft',
  'locked_future',
  'locked_dropped',
  'archived',
]);

/** هفته‌ای که برای این مقصد ارجاع نشده مثل «گزارش‌نشده» دیده می‌شود (بدون متن/فایل/نمره). */
function maskWeek(
  week: DailyApprovalWeek,
  target: DailyApprovalForwardTarget
): DailyApprovalWeek {
  if (HIDDEN_BEFORE_FORWARD.has(week.status)) return week;
  if (week.forwardedTo?.includes(target)) return week;
  return {
    ...week,
    status: 'draft',
    score: null,
    weightedScore: null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: true,
    schoolVisited: false,
    submittedAt: null,
  };
}

/**
 * گزارش دانشجو اول فقط دست استاد راهنماست؛ معلم و مدیر مدرسه فقط هفته‌هایی را
 * می‌بینند که استاد برایشان ارجاع داده. فقط mock — در real باید Nest فیلتر کند.
 */
export function maskUnforwardedWeeks(
  trainee: DailyApprovalTrainee,
  role: UserRole | null | undefined,
  passingScoreThreshold: number
): DailyApprovalTrainee {
  const target = forwardTargetForRole(role);
  if (!target) return trainee;
  const masked = {
    ...trainee,
    weeks: trainee.weeks.map((week) => maskWeek(week, target)),
  };
  return {
    ...masked,
    ...deriveDailyApprovalTraineeFields(masked, passingScoreThreshold),
  };
}
