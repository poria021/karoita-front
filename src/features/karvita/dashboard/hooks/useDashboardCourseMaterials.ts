'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT } from '@/services/bulletins/bulletin-rules';
import { sortCourseMaterials } from '@/services/course-materials/course-material-rules';
import { CourseMaterialsService } from '@/services/course-materials.service';
import { RouteService } from '@/services/route.service';
import type { CourseMaterial } from '@/types/course-materials';

import { useLearnerWorkbenchSnapshot } from './useLearnerWorkbenchSnapshot';

/**
 * جزوه‌های درس‌های همین نیم‌سال باز، برای تب میز کار.
 * کلید کوئری با صفحهٔ جزوهٔ هر درس یکی است تا کش مشترک بماند.
 */
export function useDashboardCourseMaterials(): {
  materials: CourseMaterial[];
  /** مسیر صفحهٔ جزوهٔ هر `courseKey` — `/karvita/internships/:level/materials`. */
  materialsHrefByCourseKey: ReadonlyMap<string, string>;
  isLoading: boolean;
  isError: boolean;
} {
  const desk = useLearnerWorkbenchSnapshot();
  const courses = desk.openTermCourses;

  const queries = useQueries({
    queries: courses.map((course) => ({
      queryKey: [
        ...DASHBOARD_QUERY.courseMaterialsReceived,
        course.kind,
        course.courseKey,
      ],
      queryFn: () =>
        CourseMaterialsService.listReceived(course.kind, course.courseKey),
      staleTime: QUERY_STALE_MS.list,
      retry: false,
      enabled: Boolean(course.courseKey),
    })),
  });

  const materials = sortCourseMaterials(
    queries.flatMap((query) => query.data ?? [])
  ).slice(0, DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT);

  const materialsHrefByCourseKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const course of courses) {
      if (!course.courseKey) continue;
      map.set(course.courseKey, RouteService.karvita.courseMaterials(course.level));
    }
    return map;
  }, [courses]);

  const isLoading =
    desk.isLoading || queries.some((query) => query.isLoading);
  const isError =
    desk.isError ||
    (queries.length > 0 &&
      materials.length === 0 &&
      queries.every((query) => query.isError));

  return { materials, materialsHrefByCourseKey, isLoading, isError };
}
