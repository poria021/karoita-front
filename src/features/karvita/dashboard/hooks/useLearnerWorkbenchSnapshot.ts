'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
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
  nextAction: LearnerNextAction | null;
  activeCourse: LearnerActiveCourse | null;
  openTermCourses: LearnerActiveCourse[];
  snapshots: LearnerLevelSnapshot[];
};

/**
 * وضعیت همهٔ سطوح کارورزی/کارآموزی برای میز کار دانشجو و مهارت‌آموز.
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

  const maxLevel = useMemo(() => {
    if (!role) return 0;
    return InternshipEnrollmentService.resolveLevelForRole(role, 1).maxLevel;
  }, [role]);

  const definitions = useActiveCourseDefinitions(Boolean(role));
  const catalogLevels = useMemo(() => {
    const courses =
      role === 'skill_learner' ? definitions.modular : definitions.semester;
    return [
      ...new Set(
        enrollmentLeavesOfCourses(courses).map((leaf) => leaf.level)
      ),
    ].sort((a, b) => a - b);
  }, [role, definitions.modular, definitions.semester]);

  const levels = useMemo<InternshipEnrollmentLevel[]>(() => {
    if (definitions.status === 'ready') return catalogLevels;
    return Array.from(
      { length: maxLevel },
      (_, index) => (index + 1) as InternshipEnrollmentLevel
    );
  }, [catalogLevels, definitions.status, maxLevel]);

  const enabled = Boolean(actor && actor.approved && levels.length > 0);

  const queries = useQueries({
    queries: levels.map((level) => ({
      // هم‌کلید با `useInternshipEnrollmentPage` تا کش میز کار و صفحه درس مشترک باشد.
      queryKey: [
        ...DASHBOARD_QUERY.internshipEnrollment,
        actor?.id ?? 'anon',
        actor?.role ?? 'none',
        level,
      ],
      queryFn: () => {
        if (!actor) {
          throw new Error('بارگذاری وضعیت میز کار ناموفق بود.');
        }
        return InternshipEnrollmentService.getEnrollmentPageState({
          actor,
          level,
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
    enabled &&
    snapshots.length === 0 &&
    queries.some((query) => query.isPending || query.isFetching);

  const isError =
    enabled &&
    snapshots.length === 0 &&
    queries.length > 0 &&
    queries.every((query) => query.isError);

  return {
    enabled,
    isLoading,
    isError,
    nextAction: models.nextAction,
    activeCourse: models.activeCourse,
    openTermCourses: models.openTermCourses,
    snapshots,
  };
}
