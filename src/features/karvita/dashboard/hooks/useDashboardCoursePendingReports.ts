'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  fetchLessonPendingReviews,
  type LessonPendingReview,
  type LessonReportFilter,
} from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';

const NO_CARDS: LessonPendingReview[] = [];

export type DashboardCoursePendingReportsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  /**
   * هر آیتم یک کارت. API فقط درس‌های دارای مورد در انتظار را می‌دهد؛
   * `data` خالی = هیچ کارت.
   */
  cards: LessonPendingReview[];
};

/**
 * کارت‌های «در انتظار بررسی» — `GET /reports/lessons/pending-reviews`
 * (معلم راهنما، مدیر مدرسه، استاد راهنما؛ نقش از توکن خوانده می‌شود).
 * `filter` اختیاری است: خالی = همهٔ نیم‌سال‌ها؛ با عوض‌شدن `semesterId`/`structure`
 * همان درخواست دوباره با پارامتر جدید زده می‌شود (کلید query شامل فیلتر است).
 */
export function useDashboardCoursePendingReports(
  role: UserRole,
  filter: LessonReportFilter = {}
): DashboardCoursePendingReportsState {
  const semesterId = filter.semesterId ?? '';
  const structure = filter.structure;

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.lessonPendingReviews(
      role,
      semesterId,
      structure ?? ''
    ),
    queryFn: () =>
      fetchLessonPendingReviews({
        semesterId: semesterId || undefined,
        structure,
      }),
    staleTime: QUERY_STALE_MS.module,
  });

  return {
    isLoading: query.isPending,
    isError: query.isError,
    isForbidden: isForbiddenError(query.error),
    cards: query.data ?? NO_CARDS,
  };
}
