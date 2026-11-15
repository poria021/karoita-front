import { isMockApiMode } from '@/lib/api-mode';
import {
  LEARNERS_ATTENDANCE_COLUMNS,
  PROFESSORS_ATTENDANCE_COLUMNS,
} from '@/services/reports/real/attendance-report.columns';
import {
  downloadLearnersExport,
  fetchLearnersFilterBox,
  fetchLearnersFilterBoxes,
  fetchLearnersPage,
  LEARNERS_ATTENDANCE_EXPORT_FILE,
  mapLearnerAttendanceRow,
  NEST_LEARNERS_ATTENDANCE_PATHS,
  type LearnersExportFormat,
  type LearnersFilterBox,
} from '@/services/reports/real/learners-report.api';
import {
  downloadListExport,
  fetchListFilterBox,
  fetchListFilterBoxes,
  fetchListPage,
  isListReportSlug,
  usesBatchFilterBoxes,
  type ListReportExportFormat,
} from '@/services/reports/real/list-reports.api';
import {
  isPerformanceReportSlug,
  PERFORMANCE_COLUMNS,
} from '@/services/reports/real/performance-report.mappers';
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

/** «حضور و غیاب فراگیران» (`/reports/learners/attendance`) به Nest وصل است. */
export function isRealAttendanceReport(slug: ReportSlug): boolean {
  return slug === 'attendance' && !isMockApiMode();
}

/**
 * گزارش‌های لیستی دیگر (مدارس، دانشکده‌ها، استان‌ها، معلمان،
 * مدیران مدرسه، اساتید، حضور اساتید) هم به Nest وصل‌اند.
 */
export function isRealListReport(slug: ReportSlug): boolean {
  return isListReportSlug(slug) && !isMockApiMode();
}

/** هر اسلاگی که دیگر ماکت نیست و مستقیم به Nest وصل است. */
export function isRealApiReport(slug: ReportSlug): boolean {
  return (
    isRealLearnersReport(slug) ||
    isRealListReport(slug) ||
    isRealAttendanceReport(slug)
  );
}

/** ستون‌های جدول؛ برای حضور و غیاب در حالت real فقط فیلدهای API. */
function columnDefsFor(slug: ReportSlug): ReportColumnDef[] {
  if (!isMockApiMode()) {
    if (slug === 'attendance') return LEARNERS_ATTENDANCE_COLUMNS;
    if (slug === 'professor-attendance') return PROFESSORS_ATTENDANCE_COLUMNS;
    if (isPerformanceReportSlug(slug)) return PERFORMANCE_COLUMNS[slug];
  }
  return getColumnDefs(slug);
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
 * «لیست فراگیران»، گزارش‌های لیستی (مدارس/دانشکده‌ها/استان‌ها/معلمان/
 * مدیران مدرسه/اساتید) و دو گزارش حضور و غیاب (فراگیران/اساتید راهنما)
 * به Nest وصل‌اند؛ بقیهٔ اسلاگ‌ها (عملکرد، نمرات) هنوز ماکت‌اند.
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
    if (key === 'term') return getFilterOptions(key, filters, slug);
    if (isRealLearnersReport(slug)) {
      const box = await fetchLearnersFilterBox(key, filters, {
        mode: 'term',
        termId: '',
        moduleId: '',
      });
      return box.status === 'ok' ? box.options : [];
    }
    if (isRealAttendanceReport(slug)) {
      const box = await fetchLearnersFilterBox(
        key,
        filters,
        { mode: 'term', termId: '', moduleId: '' },
        undefined,
        NEST_LEARNERS_ATTENDANCE_PATHS
      );
      return box.status === 'ok' ? box.options : [];
    }
    if (isRealListReport(slug) && isListReportSlug(slug)) {
      const box = await fetchListFilterBox(slug, key, filters, {
        mode: 'term',
        termId: '',
        moduleId: '',
      });
      return box.status === 'ok' ? box.options : [];
    }
    return getFilterOptions(key, filters, slug);
  },

  /**
   * یک باکس فیلتر برای هر گزارش real (لیست فراگیران یا یکی از گزارش‌های لیستی).
   * نتیجه می‌گوید باکس برای نقش هست یا نه و آیا انتخاب قبلی با والد جدید
   * ناسازگار است (400).
   */
  async getReportFilterBox(
    slug: ReportSlug,
    key: ReportFilterKey,
    filters: ReportFilters,
    period: ReportPeriodState
  ): Promise<LearnersFilterBox> {
    if (slug === 'learners') return fetchLearnersFilterBox(key, filters, period);
    if (isRealAttendanceReport(slug)) {
      return fetchLearnersFilterBox(
        key,
        filters,
        period,
        undefined,
        NEST_LEARNERS_ATTENDANCE_PATHS
      );
    }
    if (isListReportSlug(slug)) {
      return fetchListFilterBox(slug, key, filters, period);
    }
    return { status: 'absent' };
  },

  /**
   * حضور و غیاب (فراگیران/اساتید): همهٔ باکس‌های مجاز نقش در یک درخواست و بدون `field`.
   * برای بقیهٔ گزارش‌ها `null` (همان درخواست تک‌باکسی).
   */
  async getReportFilterBoxes(
    slug: ReportSlug,
    filters: ReportFilters,
    period: ReportPeriodState
  ): Promise<Partial<Record<ReportFilterKey, LearnersFilterBox>> | null> {
    if (isRealAttendanceReport(slug)) {
      return fetchLearnersFilterBoxes(
        filters,
        period,
        NEST_LEARNERS_ATTENDANCE_PATHS
      );
    }
    // حضور اساتید و پنج گزارش عملکرد: یک درخواست بدون field برای همهٔ باکس‌ها.
    if (isRealListReport(slug) && usesBatchFilterBoxes(slug)) {
      return fetchListFilterBoxes(slug, filters, period);
    }
    return null;
  },

  /** سازگاری عقب‌رو — فقط «لیست فراگیران». */
  async getLearnersFilterBox(
    key: ReportFilterKey,
    filters: ReportFilters,
    period: ReportPeriodState
  ): Promise<LearnersFilterBox> {
    return fetchLearnersFilterBox(key, filters, period);
  },

  /** خروجی اکسل/PDF همهٔ صفحه‌ها با همان فیلترهای جدول — برای هر گزارش real. */
  async exportReport(
    slug: ReportSlug,
    input: {
      format: LearnersExportFormat | ListReportExportFormat;
      filters: ReportFilters;
      query: string;
      period: ReportPeriodState;
    }
  ): Promise<void> {
    if (slug === 'learners') return downloadLearnersExport(input);
    if (isRealAttendanceReport(slug)) {
      return downloadLearnersExport({
        ...input,
        paths: NEST_LEARNERS_ATTENDANCE_PATHS,
        fileNames: LEARNERS_ATTENDANCE_EXPORT_FILE,
      });
    }
    if (isListReportSlug(slug)) return downloadListExport(slug, input);
  },

  /** سازگاری عقب‌رو — فقط «لیست فراگیران». */
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
    return columnDefsFor(slug);
  },

  async queryReport(input: ReportQueryInput): Promise<ReportQueryResult> {
    if (isRealLearnersReport(input.slug)) {
      const columns = columnDefsFor(input.slug);
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
    if (isRealAttendanceReport(input.slug)) {
      const columns = columnDefsFor(input.slug);
      const result = await fetchLearnersPage({
        filters: input.filters,
        query: input.query,
        period: input.period,
        page: input.page,
        limit: input.pageSize,
        paths: NEST_LEARNERS_ATTENDANCE_PATHS,
        mapRow: mapLearnerAttendanceRow,
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
    if (isRealListReport(input.slug) && isListReportSlug(input.slug)) {
      const columns = columnDefsFor(input.slug);
      const result = await fetchListPage(input.slug, {
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
