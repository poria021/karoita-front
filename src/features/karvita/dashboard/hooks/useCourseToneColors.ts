'use client';

import { useMemo } from 'react';

import { brandTone } from '@/features/karvita/reports/components/ReportCompareCharts';
import type { UserRole } from '@/types/auth';
import type { LessonReportFilter } from '@/services/reports/real/lesson-reports.api';

import { COURSE_BAR_BASE_COLOR } from '../lib/course-grade-averages';
import { useDashboardCourseGradeAverages } from './useDashboardCourseGradeAverages';

/**
 * رنگ هر درس در نمودار میانگین نمره (کلید: عنوان درس) — همان رنگی که
 * `ReportCompareCharts` به میلهٔ آن درس می‌دهد؛ تا باکس‌های دیگر میز کار
 * هر درس را با همان رنگ نشان دهند. از همان query نمودار (کش مشترک) می‌خواند.
 */
export function useCourseToneColors(
  role: UserRole,
  filter: LessonReportFilter = {}
): ReadonlyMap<string, string> {
  const desk = useDashboardCourseGradeAverages(role, filter);
  const courses = desk.courses;

  return useMemo(() => {
    const colors = new Map<string, string>();
    courses.forEach((course, index) => {
      colors.set(
        course.title,
        brandTone(COURSE_BAR_BASE_COLOR, index, courses.length)
      );
    });
    return colors;
  }, [courses]);
}
