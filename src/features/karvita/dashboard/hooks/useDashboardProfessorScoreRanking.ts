'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { UserRole } from '@/types/auth';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import {
  pickRankingItems,
  type PerformanceRankingItem,
} from '../lib/performance-ranking';

/** بدون `semesterId`؛ فقط `structure=semester` فرستاده می‌شود. */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است. */
const MAX_PAGES = 10;

export type ProfessorScoreRankingSummary = {
  weakest: PerformanceRankingItem[];
  strongest: PerformanceRankingItem[];
};

const EMPTY: ProfessorScoreRankingSummary = { weakest: [], strongest: [] };

export type DashboardProfessorScoreRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: ProfessorScoreRankingSummary;
};

/**
 * ۵ استاد ضعیف‌ترین / ۵ استاد قوی‌ترین بر اساس میانگین نمرهٔ فراگیران —
 * `GET v1/reports/professors/performance` (`averageScore`). محدوده را بک‌اند
 * از روی کاربر لاگین‌شده (دانشکده) تعیین می‌کند.
 */
export function useDashboardProfessorScoreRanking(
  role: UserRole
): DashboardProfessorScoreRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.professorScoreRanking(role),
    staleTime: QUERY_STALE_MS.module,
    queryFn: async (): Promise<ProfessorScoreRankingSummary> => {
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
      return {
        weakest: pickRankingItems('professor', collected, 'weak'),
        strongest: pickRankingItems('professor', collected, 'strong'),
      };
    },
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
