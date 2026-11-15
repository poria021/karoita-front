import { reportAccessApi } from '@/services/report-access/real/report-access.api';
import type {
  MyReportAccess,
  ReportAccessRoleId,
  ReportAccessRoleRow,
  ReportSlug,
} from '@/types/report-access';

/**
 * مدیریت دسترسی گزارش‌ها.
 * `GET /reports/access/me`، `GET /reports/access`، `PATCH /reports/access/:role`.
 */
export const ReportAccessService = {
  /** منوی گزارش کاربر جاری؛ گزارش‌هایی که در پاسخ نیستند ممنوع‌اند. */
  async getMyAccess(): Promise<MyReportAccess> {
    return reportAccessApi.getMine();
  },

  /** ماتریس همهٔ نقش‌ها برای صفحهٔ مدیریت دسترسی (ادمین/سوپرادمین). */
  async getMatrix(): Promise<ReportAccessRoleRow[]> {
    return reportAccessApi.getMatrix();
  },

  /**
   * تغییر سوییچ یک گزارش optional (فقط سوپرادمین).
   * خروجی ندارد؛ بعدش `getMatrix()` را دوباره بگیرید.
   */
  async setReportEnabled(
    roleId: ReportAccessRoleId,
    slug: ReportSlug,
    enabled: boolean
  ): Promise<void> {
    await reportAccessApi.setEnabled(roleId, slug, enabled);
  },
};
