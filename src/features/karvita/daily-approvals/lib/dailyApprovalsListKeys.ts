import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
} from '@/types/daily-approvals';

export const DAILY_APPROVALS_CACHE_NAMESPACE = 'daily-approvals';
export const DAILY_APPROVALS_CHROME_ID = 'daily-approvals';

export function dailyApprovalsListResetKey(
  kind: DailyApprovalCourseKind,
  readFilter: DailyApprovalReadFilter,
  course: DailyApprovalCourseFilter,
  termId: string,
  query: string,
  moduleId = ''
): string {
  const base = `${kind}::${readFilter}::${course}::${termId}::${query}`;
  return moduleId ? `${base}::${moduleId}` : base;
}
