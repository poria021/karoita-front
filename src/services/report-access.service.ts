import {
  mockApprovedReportAccessDocument,
  mockGetReportAccessSnapshot,
  mockSaveReportAccessMatrix,
} from '@/services/report-access/mock/mock-report-access';
import type {
  ReportAccessMatrix,
  ReportAccessSnapshot,
} from '@/types/report-access';

/**
 * مدیریت دسترسی گزارش‌ها (پنل مدیر ارشد).
 *
 * فعلاً فقط ماکت داخل Facade است تا UI قابل مرور باشد.
 * با آمدن بکند، شاخهٔ `real/` را اضافه کنید و اینجا مثل بقیهٔ سرویس‌ها
 * با `IS_MOCK_MODE` سوییچ کنید — UI/hook عوض نمی‌شود.
 */
export const ReportAccessService = {
  async getSnapshot(): Promise<ReportAccessSnapshot> {
    return mockGetReportAccessSnapshot();
  },

  async saveMatrix(matrix: ReportAccessMatrix): Promise<ReportAccessSnapshot> {
    return mockSaveReportAccessMatrix(matrix);
  },

  async getApprovedDocument(): Promise<ReportAccessMatrix> {
    return mockApprovedReportAccessDocument();
  },
};
