'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  lessonMatchesKind,
  strictLessonLevelFromTitle,
} from '@/services/internship-enrollment/real/mappers/lesson-matching';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { nestLessonTitle } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import type { CourseDefinition } from '@/types/syllabus-config';

export type EnrollableLessonCourses = {
  status: 'idle' | 'loading' | 'error' | 'ready';
  courses: CourseDefinition[];
};

type LessonLike = { id?: string; _id?: string; title?: string; name?: string };

const KIND_TITLE: Record<InternshipCourseKind, string> = {
  internship: 'کارورزی',
  apprenticeship: 'کارآموزی',
};

/**
 * درس‌هایی که دانشجو/مهارت‌آموز واقعاً می‌تواند انتخاب کند یا قبلاً گرفته:
 * lessonهای ترم باز (`open-course-selection`) + سابقه (`by-semester`).
 * تا وقتی Nest درس ترم را به «تعریف دروس» وصل نکرده، این تنها منبع درستِ
 * لینک‌های `/internships/:level` است؛ هر سطح یک‌بار، به ترتیب سطح.
 */
export function buildEnrollableCourse(
  kind: InternshipCourseKind,
  lessons: readonly LessonLike[]
): CourseDefinition | null {
  const byLevel = new Map<number, { id: string; title: string; level: number }>();
  for (const lesson of lessons) {
    const title = nestLessonTitle(lesson);
    if (!title || !lessonMatchesKind(title, kind)) continue;
    const level = strictLessonLevelFromTitle(title);
    if (level === null || byLevel.has(level)) continue;
    byLevel.set(level, {
      id: lesson.id ?? lesson._id ?? `${kind}-${level}`,
      title,
      level,
    });
  }
  if (byLevel.size === 0) return null;
  return {
    id: `enrollable::${kind}`,
    title: KIND_TITLE[kind],
    audience: kind === 'internship' ? 'semester' : 'modular',
    isActive: true,
    subModules: [...byLevel.values()].sort((a, b) => a.level - b.level),
  };
}

/** فقط real و فقط برای نقش فراگیر (`kind` غیر null). */
export function useEnrollableLessonCourses(
  kind: InternshipCourseKind | null
): EnrollableLessonCourses {
  const enabled = Boolean(kind) && !isMockApiMode();
  // همان کلیدهای `useInternshipLockedPaths` تا درخواست تکراری نرود.
  const openQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'open-course-selection'],
    queryFn: () => studentEnrollmentsApi.getOpenCourseSelection(),
    enabled,
    staleTime: QUERY_STALE_MS.module,
  });
  const bySemesterQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'by-semester'],
    queryFn: () => studentEnrollmentsApi.listBySemester(),
    enabled,
    staleTime: QUERY_STALE_MS.module,
  });

  return useMemo<EnrollableLessonCourses>(() => {
    if (!enabled || !kind) return { status: 'idle', courses: [] };
    if (openQuery.isError && bySemesterQuery.isError) {
      return { status: 'error', courses: [] };
    }
    if (openQuery.isPending || bySemesterQuery.isPending) {
      return { status: 'loading', courses: [] };
    }
    const lessons: LessonLike[] = [
      ...(openQuery.data?.lessons ?? []),
      ...(bySemesterQuery.data ?? []).flatMap((semester) => semester.lessons ?? []),
    ];
    const course = buildEnrollableCourse(kind, lessons);
    return { status: 'ready', courses: course ? [course] : [] };
  }, [
    enabled,
    kind,
    openQuery.isError,
    openQuery.isPending,
    openQuery.data,
    bySemesterQuery.isError,
    bySemesterQuery.isPending,
    bySemesterQuery.data,
  ]);
}
