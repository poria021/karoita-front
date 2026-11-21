/**
 * HTTP دسترسی گزارش‌ها (Swagger: تگ Report Access).
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) هستند؛ `api/` تکرار نشود.
 * هدرهای `Authorization` و `x-custom-lang: fa` را `apiClient` می‌گذارد.
 * شکل خطا `{ statusCode, message, error }` است و `apiClient` آن را به `ApiClientError` تبدیل می‌کند.
 */
import { apiClient } from '@/services/api-client';
import {
  mapMyReportAccess,
  mapReportAccessMatrix,
} from '@/services/report-access/real/report-access.mappers';
import {
  REPORT_ACCESS_ROLE_TO_API,
  REPORT_SLUG_TO_API,
} from '@/services/report-access/report-access-codes';
import type {
  MyReportAccess,
  ReportAccessRoleId,
  ReportAccessRoleRow,
  ReportSlug,
} from '@/types/report-access';

export const NEST_REPORT_ACCESS_PATHS = {
  me: 'v1/reports/access/me',
  matrix: 'v1/reports/access',
  role: (apiRole: string) =>
    `v1/reports/access/${encodeURIComponent(apiRole)}`,
} as const;

export const reportAccessApi = {
  /** `GET /api/v1/reports/access/me` — توکن کاربر یا ادمین. */
  async getMine(): Promise<MyReportAccess> {
    const raw = await apiClient.getJson<unknown>(NEST_REPORT_ACCESS_PATHS.me);
    return mapMyReportAccess(raw);
  },

  /** `GET /api/v1/reports/access` — فقط ادمین؛ ماتریس همهٔ نقش‌ها. */
  async getMatrix(): Promise<ReportAccessRoleRow[]> {
    const raw = await apiClient.getJson<unknown>(
      NEST_REPORT_ACCESS_PATHS.matrix
    );
    return mapReportAccessMatrix(raw);
  },

  /**
   * `PATCH /api/v1/reports/access/:role` — فقط سوپرادمین، فقط گزارش optional.
   * پاسخ (`{ role, reports: [{ report, status }] }`) عمداً نادیده گرفته می‌شود؛
   * صدا‌زننده باید بعد از موفقیت ماتریس را دوباره بگیرد.
   * خطاها: ۴۰۰ (پیش‌فرض/غیرقابل‌اعطا/نقش نامعتبر)، ۴۰۴ (نقش در دیتابیس نیست)، ۴۰۳.
   */
  async setEnabled(
    roleId: ReportAccessRoleId,
    slug: ReportSlug,
    enabled: boolean
  ): Promise<void> {
    await apiClient.patchMaybeJson<unknown>(
      NEST_REPORT_ACCESS_PATHS.role(REPORT_ACCESS_ROLE_TO_API[roleId]),
      { report: REPORT_SLUG_TO_API[slug], enabled }
    );
  },
};
