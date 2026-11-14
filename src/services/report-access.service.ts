import { isMockApiMode } from '@/lib/api-mode';
import {
  mockGetMyReportAccess,
  mockGetReportAccessMatrix,
  mockSetReportEnabled,
} from '@/services/report-access/mock/mock-report-access';
import { reportAccessApi } from '@/services/report-access/real/report-access.api';
import type {
  MyReportAccess,
  ReportAccessRoleId,
  ReportAccessRoleRow,
  ReportSlug,
} from '@/types/report-access';

/**
 * مدیریت دسترسی گزارش‌ها.
 * real: `GET /reports/access/me`، `GET /reports/access`، `PATCH /reports/access/:role`.
 * mock: همان شکل را از ماکت محلی می‌سازد تا UI در هر دو حالت یکسان باشد.
 */
export const ReportAccessService = {
  /** منوی گزارش کاربر جاری؛ گزارش‌هایی که در پاسخ نیستند ممنوع‌اند. */
  async getMyAccess(role: string): Promise<MyReportAccess> {
    if (isMockApiMode()) return mockGetMyReportAccess(role);
    return reportAccessApi.getMine();
  },

  /** ماتریس همهٔ نقش‌ها برای صفحهٔ مدیریت دسترسی (ادمین/سوپرادمین). */
  async getMatrix(): Promise<ReportAccessRoleRow[]> {
    if (isMockApiMode()) return mockGetReportAccessMatrix();
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
    if (isMockApiMode()) {
      mockSetReportEnabled(roleId, slug, enabled);
      return;
    }
    await reportAccessApi.setEnabled(roleId, slug, enabled);
  },
};
