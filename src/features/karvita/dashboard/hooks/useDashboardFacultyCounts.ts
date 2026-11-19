'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchLearnersPage } from '@/services/reports/real/learners-report.api';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { ListReportSlug } from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

/** لیست‌ها به semester وابسته نیستند؛ مثل بقیهٔ هوک‌های میز کار period خالی می‌رود. */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است. */
const MAX_PAGES = 10;

export type FacultyCounts = {
  professors: number;
  schools: number;
  learners: number;
  /** به سقف صفحه‌ها خورده؛ اعداد «دست‌کم» هستند. */
  truncated: boolean;
};

export type DashboardFacultyCountsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  counts: FacultyCounts | null;
};

async function collectAllPages(slug: ListReportSlug): Promise<{
  rows: ReportRow[];
  truncated: boolean;
}> {
  const collected: ReportRow[] = [];
  let truncated = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchListPage(slug, {
      filters: {},
      query: '',
      period: DASHBOARD_PERIOD,
      page,
    });
    collected.push(...result.rows);
    if (!result.hasNextPage) break;
    if (page === MAX_PAGES) truncated = true;
  }
  return { rows: collected, truncated };
}

async function collectLearnersCount(): Promise<{
  count: number;
  truncated: boolean;
}> {
  let count = 0;
  let truncated = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchLearnersPage({
      filters: {},
      query: '',
      period: DASHBOARD_PERIOD,
      page,
    });
    count += result.rows.length;
    if (!result.hasNextPage) break;
    if (page === MAX_PAGES) truncated = true;
  }
  return { count, truncated };
}

/** جمع شمار اساتید، مدارس و فراگیران دانشکده. */
export function summarizeFacultyCounts(input: {
  professors: readonly ReportRow[];
  schools: readonly ReportRow[];
  learners: number;
  truncated?: boolean;
}): FacultyCounts {
  return {
    professors: input.professors.length,
    schools: input.schools.length,
    learners: input.learners,
    truncated: input.truncated === true,
  };
}

/**
 * یک کوئری مشترک برای کارت‌های آمار میز کار مدیر دانشکده.
 * محدودهٔ داده را خود بک‌اند از روی کاربر لاگین‌شده تعیین می‌کند.
 */
export function useDashboardFacultyCounts(): DashboardFacultyCountsState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.facultyCounts,
    staleTime: QUERY_STALE_MS.module,
    queryFn: async () => {
      const [professors, schools, learners] = await Promise.all([
        collectAllPages('professors'),
        collectAllPages('school-performance'),
        collectLearnersCount(),
      ]);
      return summarizeFacultyCounts({
        professors: professors.rows,
        schools: schools.rows,
        learners: learners.count,
        truncated:
          professors.truncated || schools.truncated || learners.truncated,
      });
    },
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    counts: query.data ?? null,
  };
}
