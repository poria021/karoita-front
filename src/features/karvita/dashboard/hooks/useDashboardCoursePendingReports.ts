'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  fetchLessonPendingReviews,
  type LessonPendingReview,
  type LessonReportFilter,
} from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';

import { mergePendingWithCourses } from '../lib/course-pending-cards';
import { useDashboardCourseGradeAverages } from './useDashboardCourseGradeAverages';

const NO_CARDS: LessonPendingReview[] = [];

export type DashboardCoursePendingReportsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  /** هر آیتم یک کارت؛ درسِ بدون مورد در انتظار هم با عدد ۰ می‌آید. */
  cards: LessonPendingReview[];
};

/**
 * کارت‌های «در انتظار بررسی» — `GET /reports/lessons/pending-reviews` (استاد راهنما،
 * معلم راهنما، مدیر مدرسه؛ نقش از توکن خوانده می‌شود).
 * API فقط درس‌های دارای مورد در انتظار را می‌دهد؛ فهرست همهٔ دروس از
 * `average-scores` (همان کلید کش نمودار میانگین) می‌آید و کارت درس‌های بدون مورد با ۰ ساخته می‌شود.
 * اگر آن درخواست خطا بدهد فقط کارت‌های API نشان داده می‌شوند.
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

  const courses = useDashboardCourseGradeAverages(role, filter);
  const pending = query.data ?? NO_CARDS;
  const cards = useMemo(
    () =>
      mergePendingWithCourses(
        pending,
        courses.courses.map((course) => course.title)
      ),
    [pending, courses.courses]
  );

  return {
    isLoading: query.isPending || courses.isLoading,
    isError: query.isError,
    isForbidden: isForbiddenError(query.error),
    cards,
  };
}
