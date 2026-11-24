'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';

import {
  PERFORMANCE_RANKING_META,
  pickRankingItems,
  type PerformanceRankingDirection,
  type PerformanceRankingEntity,
  type PerformanceRankingItem,
} from '../lib/performance-ranking';
import { loadListRowsForOpenSemesters } from './openSemesters';

export type DashboardPerformanceRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  items: PerformanceRankingItem[];
};

/**
 * ۶ استان / ۶ دانشکدهٔ ضعیف یا قوی برای میز کار ادمین —
 * `GET v1/reports/{provinces|faculties}/performance`.
 */
export function useDashboardPerformanceRanking(
  entity: PerformanceRankingEntity,
  direction: PerformanceRankingDirection,
  enabled = true
): DashboardPerformanceRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.performanceRanking(entity, direction),
    enabled,
    staleTime: QUERY_STALE_MS.module,
    queryFn: async () => {
      const { slug } = PERFORMANCE_RANKING_META[entity];
      const { rows: collected } = await loadListRowsForOpenSemesters(slug);
      return pickRankingItems(entity, collected, direction);
    },
  });

  return {
    isLoading: enabled && query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    items: query.data ?? [],
  };
}
