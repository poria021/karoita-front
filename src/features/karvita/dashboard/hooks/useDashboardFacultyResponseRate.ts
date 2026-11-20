'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { UserRole } from '@/types/auth';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import {
  summarizeFacultyResponseRate,
  type FacultyResponseRateSummary,
} from '../lib/faculty-response-rate';

const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

const MAX_PAGES = 10;

const EMPTY: FacultyResponseRateSummary = {
  average: 0,
  high: 0,
  mid: 0,
  low: 0,
  total: 0,
  truncated: false,
};

export type DashboardFacultyResponseRateState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: FacultyResponseRateSummary;
};

/**
 * توزیع و میانگین نرخ پاسخ‌دهی اساتید دانشکده —
 * `GET v1/reports/professors/performance`. محدوده را بک‌اند تعیین می‌کند.
 * دانشگاه استانی: نرخ پاسخ‌دهی دانشکده‌ها از `GET v1/reports/faculties/performance`.
 */
export function useDashboardFacultyResponseRate(
  role: UserRole
): DashboardFacultyResponseRateState {
  const source = facultyBoxSourceFor(role);
  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.facultyResponseRate, source.slug],
    staleTime: QUERY_STALE_MS.module,
    queryFn: async () => {
      const collected: ReportRow[] = [];
      let truncated = false;
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage(source.slug, {
          filters: {},
          query: '',
          period: DASHBOARD_PERIOD,
          page,
        });
        collected.push(...result.rows);
        if (!result.hasNextPage) break;
        if (page === MAX_PAGES) truncated = true;
      }
      return summarizeFacultyResponseRate(collected, truncated);
    },
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
