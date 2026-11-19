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

/** بدون `semesterId`؛ فقط `structure=semester` فرستاده می‌شود (مثل باکس‌های عملکرد ادمین). */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است. */
const MAX_PAGES = 10;

const EMPTY: TeacherResponseRankingSummary = { weakest: [], strongest: [] };

export type DashboardTeacherResponseRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: TeacherResponseRankingSummary;
};

/**
 * ضعیف‌ترین / قوی‌ترین معلمان مدرسه بر اساس نرخ پاسخ‌دهی —
 * `GET v1/reports/teachers/performance` (`responseRate`). محدودهٔ داده (فقط معلمان
 * مدرسهٔ مدیر) را خود بک‌اند از روی کاربر لاگین‌شده تعیین می‌کند. همهٔ صفحه‌ها گرفته
 * و مرتب‌سازی سمت کلاینت است؛ معلمِ بدون نرخ هم با ۰ می‌آید (مثل جدول گزارش).
 */
export function useDashboardTeacherResponseRanking(
  role: UserRole
): DashboardTeacherResponseRankingState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.teacherResponseRanking(role),
    staleTime: QUERY_STALE_MS.module,
    queryFn: async () => {
      const collected: ReportRow[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage('teacher-performance', {
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
