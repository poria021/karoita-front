'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { useOrgReportAccess } from '@/features/karvita/reports/hooks/useOrgReportAccess';
import { withOrgReportAccessMenu } from '@/features/karvita/reports/lib/org-report-access';
import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { isMockApiMode } from '@/lib/api-mode';
import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
import { enrollmentLeavesOfCourses } from '@/services/syllabus-config/course-catalog';
import type { UserRole } from '@/types/auth';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import type { CourseDefinition } from '@/types/syllabus-config';
import { getVisibleSidebarMenu } from '@/utils/RoleStrategyMap';
import { withEnrollmentSubModules } from '@/utils/role-strategy/enrollment-menu';
import { withEvaluationSubModules } from '@/utils/role-strategy/evaluation-menu';

import { useEnrollmentLeafAvailability } from './useEnrollmentLeafAvailability';

/** query فعلی (بدون ناوبری Next) تا لینک‌های دارای `?kind=&course=` درست فعال شوند. */
export function useSidebarSearch(): string {
  return useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );
}

const NO_COURSES: readonly CourseDefinition[] = [];

function learnerKind(
  role: UserRole | string | null | undefined
): InternshipCourseKind | null {
  if (role === 'student') return 'internship';
  if (role === 'skill_learner') return 'apprenticeship';
  return null;
}

/**
 * منوی قابل‌نمایش نقش با درس‌های واقعی — برای همهٔ نقش‌ها از کاتالوگ می‌گذرد.
 * بوت سرد شل تا آماده شدن کاتالوگ لودر است (`useShellCatalogReady`).
 * - ارزیابی: mock/خطا → دو لینک پیش‌فرض؛ real خالی → لینک تخت.
 * - انتخاب واحد: mock/خطا → منوی ایستا؛ real خالی → گروه حذف.
 */
export function useSidebarMenu(role: UserRole | string | null | undefined) {
  const mock = isMockApiMode();
  const kind = learnerKind(role);
  const definitions = useActiveCourseDefinitions();
  const { grantedSlugs } = useOrgReportAccess();
  const learnerCourses =
    kind === 'internship'
      ? definitions.semester
      : kind === 'apprenticeship'
        ? definitions.modular
        : NO_COURSES;
  const leaves = useMemo(
    () => enrollmentLeavesOfCourses(learnerCourses),
    [learnerCourses]
  );
  // دانشجو/مهارت‌آموز: درس غیرفعال یا ارائه‌نشده در ترم جاری غیرفعال می‌شود،
  // مگر اینکه قبلاً آن را برداشته باشد.
  const availability = useEnrollmentLeafAvailability(
    role === 'student' || role === 'skill_learner' ? role : null,
    leaves
  );

  return useMemo(() => {
    const visible = withOrgReportAccessMenu(
      getVisibleSidebarMenu(role),
      role,
      grantedSlugs
    );
    const evaluationWhenEmpty =
      mock || definitions.status === 'error' ? 'defaults' : 'flat';
    const evaluated = withEvaluationSubModules(
      visible,
      { semester: definitions.semester, modular: definitions.modular },
      { whenEmpty: evaluationWhenEmpty }
    );
    if (!kind) return evaluated;

    const enrollmentWhenEmpty =
      mock || definitions.status === 'error' ? 'keep' : 'remove';

    return withEnrollmentSubModules(evaluated, learnerCourses, {
      whenEmpty: enrollmentWhenEmpty,
      ...availability,
    });
  }, [
    role,
    mock,
    kind,
    definitions,
    learnerCourses,
    availability,
    grantedSlugs,
  ]);
}
