'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { isForbiddenError } from '@/services/api-error';
import {
  fetchLessonAverageScores,
  type LessonAverageScore,
  type LessonReportFilter,
} from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';

import { useReportSemesterFilters } from './useReportSemesterFilters';

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
 * سرور بدون `semesterId` همهٔ نیم‌سال‌ها را جمع می‌زند، پس ترم جاری هر مسیر
 * (ترمی/پودمانی) را می‌فرستیم و نتیجه‌ها یکی می‌شوند. `filter` صریح، آن را کنار می‌گذارد.
 */
export function useDashboardCourseGradeAverages(
  role: UserRole,
  filter: LessonReportFilter = {}
): DashboardCourseGradeAveragesState {
  const semesterFilters = useReportSemesterFilters(role, filter);

  const queries = useQueries({
    queries: semesterFilters.filters.map((item) => ({
      queryKey: DASHBOARD_QUERY.lessonAverageScores(
        role,
        item.semesterId ?? '',
        item.structure ?? ''
      ),
      queryFn: () =>
        fetchLessonAverageScores({
          semesterId: item.semesterId || undefined,
          structure: item.structure,
        }),
      staleTime: QUERY_STALE_MS.module,
    })),
  });

  const dataKey = queries.map((query) => query.dataUpdatedAt).join('|');
  const courses = useMemo(() => {
    void dataKey;
    return queries.flatMap((query) => query.data ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `dataKey` همان داده‌هاست
  }, [dataKey]);

  const isLoading =
    semesterFilters.isPending || queries.some((query) => query.isPending);
  const isError =
    semesterFilters.isError ||
    (queries.some((query) => query.isError) && courses.length === 0);

  return {
    isLoading,
    isError,
    isForbidden: queries.some((query) => isForbiddenError(query.error)),
    courses,
  };
}
