import {
  LEARNERS_ATTENDANCE_COLUMNS,
  PROFESSORS_ATTENDANCE_COLUMNS,
} from '@/services/reports/real/attendance-report.columns';
import {
  downloadLearnersExport,
  fetchLearnerGradeDetail,
  fetchLearnersFilterBox,
  fetchLearnersFilterBoxes,
  fetchLearnersPage,
  LEARNERS_ATTENDANCE_EXPORT_FILE,
  LEARNERS_GRADES_EXPORT_FILE,
  mapLearnerAttendanceRow,
  mapLearnerGradeRow,
  NEST_LEARNERS_ATTENDANCE_PATHS,
  NEST_LEARNERS_GRADES_PATHS,
  type LearnersExportFormat,
  type LearnersFilterBox,
} from '@/services/reports/real/learners-report.api';
import {
  downloadListExport,
  fetchListFilterBoxes,
  fetchListFilterBox,
  fetchListPage,
  isListReportSlug,
  type ListReportExportFormat,
} from '@/services/reports/real/list-reports.api';
import {
  isPerformanceReportSlug,
  PERFORMANCE_COLUMNS,
} from '@/services/reports/real/performance-report.mappers';
import { getColumnDefs } from '@/services/reports/real/report-columns';
import type { ReportSlug } from '@/types/report-access';
import type {
  ReportColumnDef,
  ReportFilterKey,
  ReportFilters,
  ReportLearnerScoreDetail,
  ReportPeriodState,
  ReportQueryInput,
  ReportQueryResult,
  ReportSort,
} from '@/types/reports';

/** «لیست فراگیران» (`/reports/learners`). */
export function isRealLearnersReport(slug: ReportSlug): boolean {
  return slug === 'learners';
}

/** «حضور و غیاب فراگیران» (`/reports/learners/attendance`). */
export function isRealAttendanceReport(slug: ReportSlug): boolean {
  return slug === 'attendance';
}

/** «نمرات فراگیران» (`/reports/learners/grades`). */
export function isRealScoresReport(slug: ReportSlug): boolean {
  return slug === 'scores';
}

/**
 * گزارش‌های لیستی دیگر (مدارس، دانشکده‌ها، استان‌ها، معلمان، مدیران مدرسه،
 * اساتید، حضور اساتید و پنج گزارش عملکرد).
 */
export function isRealListReport(slug: ReportSlug): boolean {
  return isListReportSlug(slug);
}

/** همهٔ گزارش‌ها مستقیم به Nest وصل‌اند (داده‌ٔ ماکت وجود ندارد). */
export function isRealApiReport(slug: ReportSlug): boolean {
  return (
    isRealLearnersReport(slug) ||
    isRealListReport(slug) ||
    isRealAttendanceReport(slug) ||
    isRealScoresReport(slug)
  );
}

function unsupportedReport(slug: ReportSlug): never {
  throw new Error('گزارش «' + slug + '» به API وصل نیست.');
}

/** ستون‌های جدول؛ برای حضور و غیاب و عملکرد فقط فیلدهای API. */
function columnDefsFor(slug: ReportSlug): ReportColumnDef[] {
  if (slug === 'attendance') return LEARNERS_ATTENDANCE_COLUMNS;
  if (slug === 'professor-attendance') return PROFESSORS_ATTENDANCE_COLUMNS;
  if (isPerformanceReportSlug(slug)) return PERFORMANCE_COLUMNS[slug];
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

type LoadedPage = {
  rows: ReportQueryResult['rows'];
  page: number;
  hasNextPage: boolean;
};

function toQueryResult(
  slug: ReportSlug,
  result: LoadedPage,
  sort: ReportSort | null
): ReportQueryResult {
  const columns = columnDefsFor(slug);
  return {
    rows: sortLoadedRows(result.rows, columns, sort),
    total: result.rows.length,
    page: result.page,
    pageSize: result.rows.length,
    columns,
    hasNextPage: result.hasNextPage,
  };
}

/**
 * گزارش‌گیری پنل مدیر ارشد — همهٔ اسلاگ‌ها از Nest می‌آیند.
 * (فراگیران، حضور و غیاب، نمرات، گزارش‌های لیستی و عملکرد.)
 */
export const ReportsService = {
  /**
   * یک باکس فیلتر برای هر گزارش (فراگیران یا یکی از گزارش‌های لیستی).
   * نتیجه می‌گوید باکس برای نقش هست یا نه و آیا انتخاب قبلی با والد جدید
   * ناسازگار است (400). نمرات فراگیران باکس فیلتر ندارد.
   */
  async getReportFilterBox(
    slug: ReportSlug,
    key: ReportFilterKey,
    filters: ReportFilters,
    period: ReportPeriodState,
    /** جستجوی داخل خود باکس (`field=…&search=…`)؛ فقط همان باکس را عوض می‌کند. */
    search?: string
  ): Promise<LearnersFilterBox> {
    if (slug === 'learners') {
      return fetchLearnersFilterBox(key, filters, period, search);
    }
    if (isRealAttendanceReport(slug)) {
      return fetchLearnersFilterBox(
        key,
        filters,
        period,
        search,
        NEST_LEARNERS_ATTENDANCE_PATHS
      );
    }
    if (isListReportSlug(slug)) {
      return fetchListFilterBox(slug, key, filters, period, search);
    }
    return { status: 'absent' };
  },

  /**
   * حضور و غیاب (فراگیران/اساتید) و گزارش‌های عملکرد: همهٔ باکس‌های مجاز نقش
   * در یک درخواست و بدون `field`. برای بقیه `null` (همان درخواست تک‌باکسی).
   */
  async getReportFilterBoxes(
    slug: ReportSlug,
    filters: ReportFilters,
    period: ReportPeriodState
  ): Promise<Partial<Record<ReportFilterKey, LearnersFilterBox>> | null> {
    // یک درخواست بدون field برای همهٔ باکس‌های مجاز نقش (به‌جای یک درخواست برای هر باکس).
    if (isRealLearnersReport(slug)) {
      return fetchLearnersFilterBoxes(filters, period);
    }
    if (isRealAttendanceReport(slug)) {
      return fetchLearnersFilterBoxes(
        filters,
        period,
        NEST_LEARNERS_ATTENDANCE_PATHS
      );
    }
    if (isListReportSlug(slug)) {
      return fetchListFilterBoxes(slug, filters, period);
    }
    return null;
  },

  /** خروجی اکسل/PDF همهٔ صفحه‌ها با همان فیلترهای جدول. */
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
    if (isRealScoresReport(slug)) {
      return downloadLearnersExport({
        ...input,
        paths: NEST_LEARNERS_GRADES_PATHS,
        fileNames: LEARNERS_GRADES_EXPORT_FILE,
        searchOnly: true,
      });
    }
    if (isListReportSlug(slug)) return downloadListExport(slug, input);
    return unsupportedReport(slug);
  },

  /** تعریف ستون‌های گزارش — همگام؛ برای هدر جدول هنگام تعویض اسلاگ. */
  getColumnDefs(slug: ReportSlug): ReportColumnDef[] {
    return columnDefsFor(slug);
  },

  async queryReport(input: ReportQueryInput): Promise<ReportQueryResult> {
    const { slug } = input;
    const base = {
      filters: input.filters,
      query: input.query,
      period: input.period,
      page: input.page,
      limit: input.pageSize,
    };
    if (isRealLearnersReport(slug)) {
      return toQueryResult(slug, await fetchLearnersPage(base), input.sort);
    }
    if (isRealAttendanceReport(slug)) {
      return toQueryResult(
        slug,
        await fetchLearnersPage({
          ...base,
          paths: NEST_LEARNERS_ATTENDANCE_PATHS,
          mapRow: mapLearnerAttendanceRow,
        }),
        input.sort
      );
    }
    if (isRealScoresReport(slug)) {
      return toQueryResult(
        slug,
        await fetchLearnersPage({
          ...base,
          paths: NEST_LEARNERS_GRADES_PATHS,
          mapRow: mapLearnerGradeRow,
          searchOnly: true,
        }),
        input.sort
      );
    }
    if (isListReportSlug(slug)) {
      return toQueryResult(slug, await fetchListPage(slug, base), input.sort);
    }
    return unsupportedReport(slug);
  },

  /** ریز نمرات یک فراگیر از `grades/detail/:studentId`؛ نام از ردیف جدول می‌آید. */
  async getLearnerScoreDetails(
    learnerId: string,
    period: ReportPeriodState,
    learnerName = ''
  ): Promise<ReportLearnerScoreDetail> {
    return fetchLearnerGradeDetail(learnerId, learnerName, period);
  },
};
