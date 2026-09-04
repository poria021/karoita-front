'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { DailyApprovalsService } from '@/services/daily-approvals.service';
import type {
  DailyApprovalCatalogCourse,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
} from '@/types/daily-approvals';

const EMPTY_COURSES: DailyApprovalCatalogCourse[] = [];

type UseDailyApprovalBulkExtendCatalogArgs = {
  open: boolean;
  kind: DailyApprovalCourseKind;
  termId: string;
  preferredCourse: DailyApprovalCourseFilter;
};

export function useDailyApprovalBulkExtendCatalog({
  open,
  kind,
  termId,
  preferredCourse,
}: UseDailyApprovalBulkExtendCatalogArgs) {
  const [lessonId, setLessonId] = useState('');

  const coursesQuery = useQuery({
    queryKey: DASHBOARD_QUERY.dailyApprovalsCourses(kind, termId),
    queryFn: () => DailyApprovalsService.listCourses({ kind, termId }),
    enabled: open && Boolean(termId),
    staleTime: QUERY_STALE_MS.module,
  });

  const courses = coursesQuery.data ?? EMPTY_COURSES;
  const resolvedLessonId = useMemo(() => {
    if (!open || courses.length === 0) return lessonId || '';
    if (courses.some((course) => course.id === lessonId)) return lessonId;
    const preferred =
      preferredCourse !== 'all'
        ? courses.find((course) => course.courseFilter === preferredCourse)
        : undefined;
    return preferred?.id ?? courses[0]?.id ?? '';
  }, [courses, lessonId, open, preferredCourse]);
  const selectedCourse =
    courses.find((course) => course.id === resolvedLessonId) ?? courses[0] ?? null;

  const weeksQuery = useQuery({
    queryKey: [
      'daily-approvals',
      'weeks',
      kind,
      termId,
      selectedCourse?.id ?? '',
    ],
    queryFn: () =>
      DailyApprovalsService.listWeeks({
        kind,
        termId,
        lessonId: selectedCourse!.id,
        courseFilter: selectedCourse!.courseFilter,
      }),
    enabled: open && Boolean(termId) && Boolean(selectedCourse?.id),
    staleTime: QUERY_STALE_MS.module,
  });

  const weekOptions = useMemo(
    () => weeksQuery.data ?? [],
    [weeksQuery.data]
  );

  return {
    courses,
    coursesPending: coursesQuery.isPending,
    coursesError: coursesQuery.error
      ? coursesQuery.error instanceof Error
        ? coursesQuery.error.message
        : 'بارگذاری دروس ناموفق بود.'
      : null,
    selectedCourse,
    setLessonId,
    weekOptions,
    weeksPending: Boolean(selectedCourse) && weeksQuery.isPending,
    weeksError: weeksQuery.error
      ? weeksQuery.error instanceof Error
        ? weeksQuery.error.message
        : 'بارگذاری هفته‌ها ناموفق بود.'
      : null,
  };
}
