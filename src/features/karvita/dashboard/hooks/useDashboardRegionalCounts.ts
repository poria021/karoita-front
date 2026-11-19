'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

/** لیست مدارس به semester وابسته نیست؛ مثل بقیهٔ هوک‌های میز کار period خالی می‌رود. */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است (حداکثر ۵۰۰ مدرسه). */
const MAX_PAGES = 10;

/** برچسب‌های `genderLabel` که `mapListRow` برای `gender` = Boy | Girl می‌سازد. */
const BOYS_LABEL = 'پسرانه';
const GIRLS_LABEL = 'دخترانه';

export type RegionalCounts = {
  schools: number;
  teachers: number;
  learners: number;
  /** مدارس پسرانه / دخترانه؛ مدرسهٔ بدون جنسیت در هیچ‌کدام نیست. */
  boysSchools: number;
  girlsSchools: number;
  /** به سقف صفحه‌ها خورده؛ اعداد «دست‌کم» هستند. */
  truncated: boolean;
};

export type DashboardRegionalCountsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  counts: RegionalCounts | null;
};

/** جمع شمار مدارس، معلمان، فراگیران و تفکیک جنسیت از ردیف‌های گزارش مدارس. */
export function summarizeRegionalCounts(
  rows: readonly ReportRow[],
  truncated = false
): RegionalCounts {
  let teachers = 0;
  let learners = 0;
  let boysSchools = 0;
  let girlsSchools = 0;
  for (const row of rows) {
    teachers += typeof row.nT === 'number' ? row.nT : 0;
    learners += typeof row.n === 'number' ? row.n : 0;
    if (row.genderLabel === BOYS_LABEL) boysSchools += 1;
    else if (row.genderLabel === GIRLS_LABEL) girlsSchools += 1;
  }
  return {
    schools: rows.length,
    teachers,
    learners,
    boysSchools,
    girlsSchools,
    truncated,
  };
}

/**
 * یک کوئری مشترک برای همهٔ باکس‌های میز کار آموزش و پرورش منطقه که از لیست مدارس
 * می‌خوانند (شمار منطقه + تفکیک دخترانه/پسرانه) — `GET v1/reports/schools`، همهٔ
 * صفحه‌ها. هر باکس همین کوئری را می‌خواند، پس درخواست اضافه نمی‌رود. محدودهٔ داده
 * (مدارس منطقهٔ کاربر) را خود بک‌اند از روی کاربر لاگین‌شده تعیین می‌کند.
 */
function useRegionalSchoolsQuery() {
  return useQuery({
    queryKey: DASHBOARD_QUERY.regionalSchools,
    staleTime: QUERY_STALE_MS.module,
    queryFn: async () => {
      const collected: ReportRow[] = [];
      let truncated = false;
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage('schools', {
          filters: {},
          query: '',
          period: DASHBOARD_PERIOD,
          page,
        });
        collected.push(...result.rows);
        if (!result.hasNextPage) break;
        if (page === MAX_PAGES) truncated = true;
      }
      return summarizeRegionalCounts(collected, truncated);
    },
  });
}

/** شمار منطقه: مدارس، معلمان، فراگیران. */
export function useDashboardRegionalCounts(): DashboardRegionalCountsState {
  const query = useRegionalSchoolsQuery();
  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    counts: query.data ?? null,
  };
}
