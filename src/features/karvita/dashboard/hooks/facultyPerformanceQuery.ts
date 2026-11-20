import { queryOptions } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import type { FacultyBoxSource } from '../lib/faculty-box-source';

/** بدون `semesterId`؛ فقط `structure=semester` (مثل بقیهٔ هوک‌های میز کار). */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

const MAX_PAGES = 10;

export type FacultyPerformanceSlug = FacultyBoxSource['slug'];

export type FacultyPerformanceSnapshot = {
  rows: ReportRow[];
  truncated: boolean;
};

/** همهٔ صفحات یک گزارش عملکرد دانشکده/اساتید — یک بار برای چند باکس میز کار. */
export async function loadFacultyPerformanceRows(
  slug: FacultyPerformanceSlug
): Promise<FacultyPerformanceSnapshot> {
  const rows: ReportRow[] = [];
  let truncated = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchListPage(slug, {
      filters: {},
      query: '',
      period: DASHBOARD_PERIOD,
      page,
    });
    rows.push(...result.rows);
    if (!result.hasNextPage) break;
    if (page === MAX_PAGES) truncated = true;
  }
  return { rows, truncated };
}

/**
 * کوئری مشترک میز کار دانشکده / دانشگاه استانی.
 * نرخ پاسخ، رتبه‌بندی نمره، رتبه‌بندی حضور و شمار دانشکده‌ها از همین key می‌خوانند.
 */
export function facultyPerformanceQueryOptions(slug: FacultyPerformanceSlug) {
  return queryOptions({
    queryKey: DASHBOARD_QUERY.facultyPerformanceRows(slug),
    queryFn: () => loadFacultyPerformanceRows(slug),
    staleTime: QUERY_STALE_MS.module,
  });
}
