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

export type SchoolRankingSummary = {
  weakest: PerformanceRankingItem[];
  strongest: PerformanceRankingItem[];
};

const EMPTY: SchoolRankingSummary = { weakest: [], strongest: [] };

export type DashboardSchoolRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: SchoolRankingSummary;
};

/**
 * ۶ مدرسهٔ ضعیف‌ترین / ۶ مدرسهٔ قوی‌ترین بر اساس میانگین نمرهٔ فراگیران —
 * `GET v1/reports/schools/performance` (`averageScore`). محدودهٔ داده (مدارس منطقهٔ
 * کاربر) را خود بک‌اند از روی کاربر لاگین‌شده تعیین می‌کند. همهٔ صفحه‌ها یک‌بار گرفته
 * می‌شود و هر دو فهرست (ضعیف/قوی) از همان داده ساخته می‌شود؛ مدرسهٔ بدون نمره هم با ۰
 * می‌آید (مثل جدول گزارش).
 */
export function useDashboardSchoolRanking(
  role: UserRole
): DashboardSchoolRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.schoolRanking(role),
    staleTime: QUERY_STALE_MS.module,
    queryFn: async (): Promise<SchoolRankingSummary> => {
      const { rows: collected } = await loadListRowsForOpenSemesters('school-performance');
      return {
        weakest: pickRankingItems('school', collected, 'weak'),
        strongest: pickRankingItems('school', collected, 'strong'),
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
