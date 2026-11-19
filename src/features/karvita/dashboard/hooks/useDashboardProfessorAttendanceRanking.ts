'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { UserRole } from '@/types/auth';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import {
  buildProfessorAttendanceRanking,
  type ProfessorAttendanceRankingSummary,
} from '../lib/professor-attendance-ranking';

const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

const MAX_PAGES = 10;

const EMPTY: ProfessorAttendanceRankingSummary = {
  weakest: [],
  strongest: [],
};

export type DashboardProfessorAttendanceRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: ProfessorAttendanceRankingSummary;
};

/**
 * ضعیف‌ترین / قوی‌ترین اساتید دانشکده بر اساس درصد حضور —
 * `GET v1/reports/professors/performance` (`attendancePercent`).
 */
export function useDashboardProfessorAttendanceRanking(
  role: UserRole
): DashboardProfessorAttendanceRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.professorAttendanceRanking(role),
    staleTime: QUERY_STALE_MS.module,
    queryFn: async () => {
      const collected: ReportRow[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage('professor-performance', {
          filters: {},
          query: '',
          period: DASHBOARD_PERIOD,
          page,
        });
        collected.push(...result.rows);
        if (!result.hasNextPage) break;
      }
      return buildProfessorAttendanceRanking(collected);
    },
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
