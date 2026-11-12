import {
  getCompareItems,
  getFilterCatalog,
  getFilterOptions,
  getLearnerCourseDetails,
  getLearnerScoreDetails,
  queryReport,
} from '@/services/reports/mock/mock-reports-query';
import type { ReportSlug } from '@/types/report-access';
import type {
  ReportCompareItem,
  ReportFilterCatalog,
  ReportFilterKey,
  ReportFilters,
  ReportLearnerCourseDetail,
  ReportLearnerScoreDetail,
  ReportPeriodState,
  ReportQueryInput,
  ReportQueryResult,
} from '@/types/reports';

/**
 * گزارش‌گیری پنل مدیر ارشد.
 *
 * فعلاً فقط ماکت داخل Facade است تا UI قابل مرور باشد.
 * با آمدن بکند، شاخهٔ `real/` را اضافه کنید و اینجا مثل بقیهٔ سرویس‌ها
 * با `IS_MOCK_MODE` سوییچ کنید — UI/hook عوض نمی‌شود.
 */
export const ReportsService = {
  async getFilterCatalog(): Promise<ReportFilterCatalog> {
    return getFilterCatalog();
  },

  async getFilterOptions(
    key: ReportFilterKey | 'term',
    filters: ReportFilters,
    slug: ReportSlug
  ): Promise<import('@/types/reports').ReportOption[]> {
    return getFilterOptions(key, filters, slug);
  },

  async queryReport(input: ReportQueryInput): Promise<ReportQueryResult> {
    return queryReport(input);
  },

  async getLearnerCourseDetails(
    learnerId: string,
    period: ReportPeriodState
  ): Promise<ReportLearnerCourseDetail | null> {
    return getLearnerCourseDetails(learnerId, period);
  },

  async getLearnerScoreDetails(
    learnerId: string,
    period: ReportPeriodState
  ): Promise<ReportLearnerScoreDetail | null> {
    return getLearnerScoreDetails(learnerId, period);
  },

  async getCompareItems(
    slug: ReportSlug,
    ids: string[],
    period: ReportPeriodState
  ): Promise<ReportCompareItem[]> {
    return getCompareItems(slug, ids, period);
  },
};
