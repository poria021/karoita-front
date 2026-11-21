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

/** بدون `semesterId`؛ فقط `structure=semester` فرستاده می‌شود (مثل باکس‌های عملکرد ادمین). */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است. */
const MAX_PAGES = 10;

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
      const collected: ReportRow[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage('school-performance', {
          filters: {},
          query: '',
          period: DASHBOARD_PERIOD,
          page,
        });
        collected.push(...result.rows);
        if (!result.hasNextPage) break;
      }
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
