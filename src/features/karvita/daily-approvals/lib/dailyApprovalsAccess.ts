import type { UserRole } from '@/types/auth';

export const DAILY_APPROVALS_ROLES = [
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
] as const;

export type DailyApprovalsRole = (typeof DAILY_APPROVALS_ROLES)[number];

export function isDailyApprovalsRole(
  role: UserRole | null | undefined
): role is DailyApprovalsRole {
  return (
    role === 'supervisor_professor' ||
    role === 'mentor_teacher' ||
    role === 'school_principal'
  );
}

/** فقط استاد راهنما دکمهٔ عملیات (حذف کارورز) را می‌بیند. */
export function canDropDailyApprovalTrainee(
  role: UserRole | null | undefined
): boolean {
  return role === 'supervisor_professor';
}

/** تمدید گروهی مهلت ارسال گزارش — فقط استاد راهنما. */
export function canBulkExtendDailyApprovalWeeks(
  role: UserRole | null | undefined
): boolean {
  return role === 'supervisor_professor';
}
