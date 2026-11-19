'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { UserRole } from '@/types/auth';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import {
  buildTeacherResponseRanking,
  type TeacherResponseRankingSummary,
} from '../lib/teacher-response-ranking';

/** بدون `semesterId`؛ فقط `structure=semester` فرستاده می‌شود. */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است. */
const MAX_PAGES = 10;

const EMPTY: TeacherResponseRankingSummary = { weakest: [], strongest: [] };

export type DashboardProfessorResponseRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: TeacherResponseRankingSummary;
};

/**
 * ضعیف‌ترین / قوی‌ترین اساتید دانشکده بر اساس نرخ پاسخ‌دهی —
 * `GET v1/reports/professors/performance` (`responseRate`). محدودهٔ داده را
 * خود بک‌اند از روی کاربر لاگین‌شده تعیین می‌کند.
 */
export function useDashboardProfessorResponseRanking(
  role: UserRole
): DashboardProfessorResponseRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.professorResponseRanking(role),
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
      return buildTeacherResponseRanking(collected);
    },
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
