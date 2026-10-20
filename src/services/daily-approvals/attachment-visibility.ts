import { deriveDailyApprovalTraineeFields } from '@/services/daily-approvals/daily-approval-derived';
import type { UserRole } from '@/types/auth';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekDetail,
} from '@/types/daily-approvals';

/** نقش‌هایی که فایل پیوست گزارش را فقط با اجازهٔ استاد راهنما می‌بینند. */
const ATTACHMENT_OBSERVER_ROLES = new Set<UserRole>(['mentor_teacher', 'school_principal']);

export function isAttachmentObserverRole(role: UserRole | null | undefined): boolean {
  return Boolean(role && ATTACHMENT_OBSERVER_ROLES.has(role));
}

/** کلید `canWatchOthers` پیش‌فرض false است؛ فقط true صریح فایل را باز می‌کند. */
export function canObserverSeeAttachments(week: Pick<DailyApprovalWeek, 'canWatchOthers'>): boolean {
  return week.canWatchOthers === true;
}

/**
 * متن/نمره/وضعیت گزارش برای هر سه نقش بازبین یکسان است؛ فقط فایل‌های پیوست برای
 * معلم راهنما و مدیر مدرسه تا وقتی استاد `canWatchOthers` را true نکرده خالی می‌شود.
 */
export function maskWeekAttachments(
  week: DailyApprovalWeek,
  role: UserRole | null | undefined
): DailyApprovalWeek {
  if (!isAttachmentObserverRole(role) || canObserverSeeAttachments(week)) return week;
  if (week.files.length === 0 && week.filesHidden) return week;
  return { ...week, files: [], filesHidden: true };
}

export function maskDetailAttachments(
  detail: DailyApprovalWeekDetail,
  role: UserRole | null | undefined,
  canWatchOthers: boolean | undefined
): DailyApprovalWeekDetail {
  if (!isAttachmentObserverRole(role) || canWatchOthers === true) return detail;
  return { ...detail, files: [], filesHidden: true };
}

/** mock: فایل پیوست هفته‌های یک کارورز را برای معلم/مدیر مدرسه تا اجازهٔ استاد پنهان می‌کند. */
export function maskTraineeAttachments(
  trainee: DailyApprovalTrainee,
  role: UserRole | null | undefined,
  passingScoreThreshold: number
): DailyApprovalTrainee {
  if (!isAttachmentObserverRole(role)) return trainee;
  const masked = {
    ...trainee,
    weeks: trainee.weeks.map((week) => maskWeekAttachments(week, role)),
  };
  return {
    ...masked,
    ...deriveDailyApprovalTraineeFields(masked, passingScoreThreshold),
  };
}
