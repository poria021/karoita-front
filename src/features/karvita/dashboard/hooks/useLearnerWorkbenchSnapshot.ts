'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useMemo } from 'react';

import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { kindForRole } from '@/services/internship-enrollment/enrollment-mappers';
import {
  enrolledLevelsFromSemesters,
  openLevelsFromLessons,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { enrollmentLeavesOfCourses } from '@/services/syllabus-config/course-catalog';
import { useUserStore } from '@/store/useUserStore';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentRole,
} from '@/types/internship-enrollment';

import {
  buildLearnerWorkbenchModels,
  type LearnerActiveCourse,
  type LearnerLevelSnapshot,
  type LearnerNextAction,
} from '../lib/learner-workbench';

function isEnrollmentRole(
  role: string | undefined
): role is InternshipEnrollmentRole {
  return role === 'student' || role === 'skill_learner';
}

export type LearnerWorkbenchSnapshot = {
  enabled: boolean;
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  nextAction: LearnerNextAction | null;
  activeCourse: LearnerActiveCourse | null;
  openTermCourses: LearnerActiveCourse[];
  snapshots: LearnerLevelSnapshot[];
};

/**
 * وضعیت درس‌های کارورزی/کارآموزی برای میز کار دانشجو و مهارت‌آموز.
 * همهٔ leafها داینامیک‌اند؛ فقط سطح‌هایی که در ترم باز ارائه شده‌اند یا
 * سابقهٔ ثبت‌نام دارند fetch می‌شوند تا برای هر ردیف کاتالوگ یک
 * `getEnrollmentPageState` جدا نزنیم.
 */
export function useLearnerWorkbenchSnapshot(): LearnerWorkbenchSnapshot {
  const activeUser = useUserStore((state) => state.activeUser);
  const role = isEnrollmentRole(activeUser?.role) ? activeUser.role : null;

  const actor = useMemo<InternshipEnrollmentActor | null>(
    () =>
      activeUser && role
        ? {
            id: activeUser.id,
            role,
            approved: activeUser.approved,
            province: activeUser.province,
            college: activeUser.college,
            district: activeUser.district,
            specialPermissions: activeUser.specialPermissions,
          }
        : null,
    [activeUser, role]
  );

  const definitions = useActiveCourseDefinitions(Boolean(role));
  const leaves = useMemo(() => {
    const courses =
      role === 'skill_learner' ? definitions.modular : definitions.semester;
    return enrollmentLeavesOfCourses(courses);
  }, [role, definitions.modular, definitions.semester]);

  const leafRefs = useMemo(
    () => leaves.map((leaf) => ({ level: leaf.level, title: leaf.title })),
    [leaves]
  );

  const kind = role ? kindForRole(role) : null;
  const overviewEnabled =
    Boolean(role && kind) &&
    definitions.status === 'ready' &&
    leafRefs.length > 0;

  // هم‌کلید با سایدبار / خوش‌آمد — درخواست اضافه نمی‌زند.
  const openQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'open-course-selection'],
    queryFn: () => studentEnrollmentsApi.getOpenCourseSelection(),
    enabled: overviewEnabled,
    staleTime: QUERY_STALE_MS.enrollment,
    retry: false,
  });
  const bySemesterQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'by-semester'],
    queryFn: () => studentEnrollmentsApi.listBySemester(),
    enabled: overviewEnabled,
    staleTime: QUERY_STALE_MS.enrollment,
    retry: false,
  });

  const levels = useMemo<InternshipEnrollmentLevel[]>(() => {
    if (definitions.status !== 'ready' || !kind || leafRefs.length === 0) {
      return [];
    }
    if (openQuery.isPending || bySemesterQuery.isPending) return [];

    const relevant = new Set<number>([
      ...openLevelsFromLessons(openQuery.data?.lessons ?? [], kind, leafRefs),
      ...enrolledLevelsFromSemesters(
        bySemesterQuery.data ?? [],
        kind,
        leafRefs
      ),
    ]);

    return [...relevant].sort((a, b) => a - b);
  }, [
    bySemesterQuery.data,
    bySemesterQuery.isPending,
    definitions.status,
    kind,
    leafRefs,
    openQuery.data,
    openQuery.isPending,
  ]);

  const overviewReady =
    definitions.status === 'ready' &&
    !openQuery.isPending &&
    !bySemesterQuery.isPending;
  const enabled = Boolean(
    actor && actor.approved && overviewReady && levels.length > 0
  );

  const queries = useQueries({
    queries: levels.map((level) => ({
      // کلید جدا از `useInternshipEnrollmentPage`: این کوئری فقط `weeks` دارد (بدون messages) و نباید کش صفحه‌ی کامل را پر کند.
      queryKey: [
        ...DASHBOARD_QUERY.internshipEnrollment,
        actor?.id ?? 'anon',
        actor?.role ?? 'none',
        level,
        'weeks-only',
      ],
      queryFn: () => {
        if (!actor) {
          throw new Error('بارگذاری وضعیت میز کار ناموفق بود.');
        }
        return InternshipEnrollmentService.getEnrollmentPageState({
          actor,
          level,
          weeksOnly: true,
        });
      },
      enabled,
      staleTime: QUERY_STALE_MS.module,
      retry: false,
    })),
  });

  const snapshots = useMemo<LearnerLevelSnapshot[]>(() => {
    const rows: LearnerLevelSnapshot[] = [];
    for (let index = 0; index < levels.length; index += 1) {
      const data = queries[index]?.data;
      if (!data) continue;
      rows.push({ level: levels[index]!, state: data });
    }
    return rows;
  }, [levels, queries]);

  const models = useMemo(
    () => buildLearnerWorkbenchModels(snapshots),
    [snapshots]
  );

  const isLoading =
    Boolean(actor?.approved) &&
    (definitions.status === 'loading' ||
      (overviewEnabled && (openQuery.isPending || bySemesterQuery.isPending)) ||
      (enabled &&
        snapshots.length === 0 &&
        queries.some((query) => query.isPending || query.isFetching)));

  const isError =
    enabled &&
    snapshots.length === 0 &&
    queries.length > 0 &&
    queries.every((query) => query.isError);

  const isForbidden =
    isError && queries.some((query) => isForbiddenError(query.error));

  return {
    enabled,
    isLoading,
    isError,
    isForbidden,
    nextAction: models.nextAction,
    activeCourse: models.activeCourse,
    openTermCourses: models.openTermCourses,
    snapshots,
  };
}
