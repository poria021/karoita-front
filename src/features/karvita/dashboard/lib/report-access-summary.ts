import type { ReportAccessRoleId, ReportAccessRoleRow } from '@/types/report-access';

export type ReportAccessRoleSummary = {
  roleId: ReportAccessRoleId;
  /** گزارش‌هایی که این نقش مجاز به آن‌هاست (در پاسخ آمده‌اند). */
  total: number;
  /** وضعیت `active` — منوی گزارش برای نقش باز است. */
  active: number;
  /** اختیاری‌هایی که هنوز فعال نشده‌اند (قابل فعال‌سازی توسط مدیر ارشد). */
  pendingOptional: number;
};

export type ReportAccessTone = 'none' | 'partial' | 'full';

/** خلاصهٔ هر نقش از ماتریس `GET /reports/access` — ترتیب پاسخ حفظ می‌شود. */
export function summarizeReportAccess(
  rows: readonly ReportAccessRoleRow[]
): ReportAccessRoleSummary[] {
  return rows.map((row) => ({
    roleId: row.roleId,
    total: row.reports.length,
    active: row.reports.filter((report) => report.status === 'active').length,
    pendingOptional: row.reports.filter(
      (report) => report.access === 'optional' && report.status === 'inactive'
    ).length,
  }));
}

/** صفر فعال → هشدار؛ بخشی فعال → متوسط؛ همه فعال → کامل. */
export function reportAccessTone(
  summary: Pick<ReportAccessRoleSummary, 'total' | 'active'>
): ReportAccessTone {
  if (summary.active <= 0) return 'none';
  return summary.active < summary.total ? 'partial' : 'full';
}
