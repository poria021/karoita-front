'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

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
    queryKey: ['daily-approvals', 'courses', kind, termId],
    queryFn: () => DailyApprovalsService.listCourses({ kind, termId }),
    enabled: open && Boolean(termId),
    staleTime: QUERY_STALE_MS.module,
  });

  const courses = coursesQuery.data ?? EMPTY_COURSES;
  const selectedCourse =
    courses.find((course) => course.id === lessonId) ?? courses[0] ?? null;

  useEffect(() => {
    if (!open || courses.length === 0) return;
    const preferred =
      preferredCourse !== 'all'
        ? courses.find((course) => course.courseFilter === preferredCourse)
        : undefined;
    const nextId = preferred?.id ?? courses[0]?.id ?? '';
    setLessonId((current) =>
      courses.some((course) => course.id === current) ? current : nextId
    );
  }, [courses, open, preferredCourse]);

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
