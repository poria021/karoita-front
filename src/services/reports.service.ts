import { isMockApiMode } from '@/lib/api-mode';
import {
  downloadLearnersExport,
  fetchLearnersFilterBox,
  fetchLearnersPage,
  type LearnersExportFormat,
  type LearnersFilterBox,
} from '@/services/reports/real/learners-report.api';
import {
  getColumnDefs,
  getCompareItems,
  getFilterCatalog,
  getFilterOptions,
  getLearnerCourseDetails,
  getLearnerScoreDetails,
  queryReport,
} from '@/services/reports/mock/mock-reports-query';
import type { ReportSlug } from '@/types/report-access';
import type {
  ReportColumnDef,
  ReportCompareItem,
  ReportFilterCatalog,
  ReportFilterKey,
  ReportFilters,
  ReportLearnerCourseDetail,
  ReportLearnerScoreDetail,
  ReportPeriodState,
  ReportQueryInput,
  ReportQueryResult,
  ReportSort,
} from '@/types/reports';

/** فقط «لیست فراگیران» به Nest وصل است؛ بقیهٔ اسلاگ‌ها هنوز ماکت‌اند. */
export function isRealLearnersReport(slug: ReportSlug): boolean {
  return slug === 'learners' && !isMockApiMode();
}

/** Nest مرتب‌سازی ندارد؛ فقط ردیف‌های بارگذاری‌شده را مرتب می‌کنیم. */
function sortLoadedRows(
  rows: ReportQueryResult['rows'],
  columns: ReportColumnDef[],
  sort: ReportSort | null
): ReportQueryResult['rows'] {
  if (!sort) return rows;
  const column = columns.find((c) => c.id === sort.id);
  if (!column || column.nosort) return rows;
  const key = column.sortKey ?? column.id;
  const dir = sort.dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const x = a[key];
    const y = b[key];
    if (x === undefined || y === undefined) return 0;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
    return String(x).localeCompare(String(y), 'fa') * dir;
  });
}

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
    if (isRealLearnersReport(slug) && key !== 'term') {
      const box = await fetchLearnersFilterBox(key, filters, {
        mode: 'term',
        termId: '',
        moduleId: '',
      });
      return box.status === 'ok' ? box.options : [];
    }
    return getFilterOptions(key, filters, slug);
  },

  /**
   * یک باکس فیلتر «لیست فراگیران» (فقط real). نتیجه می‌گوید باکس برای نقش هست یا نه
   * و آیا انتخاب قبلی با والد جدید ناسازگار است (400).
   */
  async getLearnersFilterBox(
    key: ReportFilterKey,
    filters: ReportFilters,
    period: ReportPeriodState
  ): Promise<LearnersFilterBox> {
    return fetchLearnersFilterBox(key, filters, period);
  },

  /** خروجی اکسل/PDF همهٔ صفحه‌ها با همان فیلترهای جدول (فقط real). */
  async exportLearners(input: {
    format: LearnersExportFormat;
    filters: ReportFilters;
    query: string;
    period: ReportPeriodState;
  }): Promise<void> {
    return downloadLearnersExport(input);
  },

  /** تعریف ستون‌های گزارش — همگام؛ برای هدر جدول هنگام تعویض اسلاگ. */
  getColumnDefs(slug: ReportSlug): ReportColumnDef[] {
    return getColumnDefs(slug);
  },

  async queryReport(input: ReportQueryInput): Promise<ReportQueryResult> {
    if (isRealLearnersReport(input.slug)) {
      const columns = getColumnDefs(input.slug);
      const result = await fetchLearnersPage({
        filters: input.filters,
        query: input.query,
        period: input.period,
        page: input.page,
        limit: input.pageSize,
      });
      return {
        rows: sortLoadedRows(result.rows, columns, input.sort),
        total: result.rows.length,
        page: result.page,
        pageSize: result.rows.length,
        columns,
        hasNextPage: result.hasNextPage,
      };
    }
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
