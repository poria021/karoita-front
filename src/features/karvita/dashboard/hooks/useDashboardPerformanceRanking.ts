'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import {
  PERFORMANCE_RANKING_META,
  pickRankingItems,
  type PerformanceRankingDirection,
  type PerformanceRankingEntity,
  type PerformanceRankingItem,
} from '../lib/performance-ranking';

/** بدون `semesterId`؛ فقط `structure=semester` فرستاده می‌شود. */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/**
 * ردیف‌های بدون نمره (null) هم با ۰ در رتبه‌بندی‌اند. درخواست بدون `sortBy` می‌رود
 * (مثل جدول گزارش) تا همهٔ ردیف‌ها بیایند؛ همهٔ صفحه‌ها (هر صفحه ۵۰ ردیف) گرفته و
 * مرتب‌سازی سمت کلاینت است. سقف صفحه فقط محافظ است.
 */
const MAX_PAGES = 10;

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
      const collected: ReportRow[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage(slug, {
          filters: {},
          query: '',
          period: DASHBOARD_PERIOD,
          page,
          // عمداً بدون sort: با `sortBy=averageScore` Nest ردیف‌های بدون نمره را برنمی‌گرداند.
        });
        collected.push(...result.rows);
        if (!result.hasNextPage) break;
      }
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
