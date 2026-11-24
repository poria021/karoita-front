'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import type { UserRole } from '@/types/auth';

import {
  pickRankingItems,
  type PerformanceRankingItem,
} from '../lib/performance-ranking';
import { loadListRowsForOpenSemesters } from './openSemesters';

export type ProvinceRankingSummary = {
  weakest: PerformanceRankingItem[];
  strongest: PerformanceRankingItem[];
};

const EMPTY: ProvinceRankingSummary = { weakest: [], strongest: [] };

export type DashboardProvinceRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: ProvinceRankingSummary;
};

/**
 * ۶ استان ضعیف‌ترین / ۶ استان قوی‌ترین بر اساس میانگین نمرهٔ فراگیران —
 * `GET v1/reports/provinces/performance` (`averageScore`). برای میز کار سازمان
 * مرکزی. همهٔ صفحه‌ها یک‌بار گرفته می‌شود و هر دو فهرست (ضعیف/قوی) از همان داده
 * ساخته می‌شود؛ استان بدون نمره هم با ۰ می‌آید (مثل جدول گزارش).
 */
export function useDashboardProvinceRanking(
  role: UserRole
): DashboardProvinceRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.provinceRanking(role),
    staleTime: QUERY_STALE_MS.module,
    queryFn: async (): Promise<ProvinceRankingSummary> => {
      const { rows: collected } = await loadListRowsForOpenSemesters('province-performance');
      return {
        weakest: pickRankingItems('province', collected, 'weak'),
        strongest: pickRankingItems('province', collected, 'strong'),
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
