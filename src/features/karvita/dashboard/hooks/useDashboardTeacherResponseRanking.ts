'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import type { UserRole } from '@/types/auth';

import {
  buildTeacherResponseRanking,
  type TeacherResponseRankingSummary,
} from '../lib/teacher-response-ranking';
import { loadListRowsForOpenSemesters } from './openSemesters';

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
      const { rows: collected } = await loadListRowsForOpenSemesters('teacher-performance');
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
