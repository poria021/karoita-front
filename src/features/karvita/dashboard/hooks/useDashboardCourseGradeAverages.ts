'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  fetchLessonAverageScores,
  type LessonAverageScore,
  type LessonReportFilter,
} from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';

const NO_COURSES: LessonAverageScore[] = [];

export type DashboardCourseGradeAveragesState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  /** هر آیتم یک میله؛ `averageScore: null` یعنی نمرهٔ پایانی هنوز ثبت نشده. */
  courses: LessonAverageScore[];
};

/**
 * «میانگین نمرهٔ دروس» — `GET /reports/lessons/average-scores` (معلم راهنما،
 * مدیر مدرسه، استاد راهنما؛ نقش از توکن خوانده می‌شود؛ نقش‌های دیگر ۴۰۳).
 * `filter` اختیاری است: خالی = همهٔ نیم‌سال‌ها؛ با عوض‌شدن `semesterId`/`structure`
 * همان درخواست دوباره با پارامتر جدید زده می‌شود (کلید query شامل فیلتر است).
 */
export function useDashboardCourseGradeAverages(
  role: UserRole,
  filter: LessonReportFilter = {}
): DashboardCourseGradeAveragesState {
  const semesterId = filter.semesterId ?? '';
  const structure = filter.structure;

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.lessonAverageScores(
      role,
      semesterId,
      structure ?? ''
    ),
    queryFn: () =>
      fetchLessonAverageScores({
        semesterId: semesterId || undefined,
        structure,
      }),
    staleTime: QUERY_STALE_MS.module,
  });

  return {
    isLoading: query.isPending,
    isError: query.isError,
    isForbidden: isForbiddenError(query.error),
    courses: query.data ?? NO_COURSES,
  };
}
