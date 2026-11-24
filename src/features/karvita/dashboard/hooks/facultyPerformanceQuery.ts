import { queryOptions } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import type { ReportRow } from '@/types/reports';

import type { FacultyBoxSource } from '../lib/faculty-box-source';
import { loadListRowsForOpenSemesters } from './openSemesters';

export type FacultyPerformanceSlug = FacultyBoxSource['slug'];

export type FacultyPerformanceSnapshot = {
  rows: ReportRow[];
  truncated: boolean;
};

/**
 * همهٔ صفحات یک گزارش عملکرد دانشکده/اساتید برای «آخرین نیم‌سال باز» — یک بار برای
 * چند باکس میز کار. بدون نیم‌سال باز ردیفی نیست (هرگز «همهٔ نیم‌سال‌ها» نمی‌آید).
 */
export async function loadFacultyPerformanceRows(
  slug: FacultyPerformanceSlug
): Promise<FacultyPerformanceSnapshot> {
  return loadListRowsForOpenSemesters(slug);
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
