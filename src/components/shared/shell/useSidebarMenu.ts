'use client';

import { useMemo, useSyncExternalStore } from 'react';

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

/** نقش‌هایی که ماژول «ارزیابی گزارش‌های فراگیران» را دارند. */
const REVIEW_ROLES = new Set<string>([
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
]);

const NO_COURSES: readonly CourseDefinition[] = [];

function learnerKind(
  role: UserRole | string | null | undefined
): InternshipCourseKind | null {
  if (role === 'student') return 'internship';
  if (role === 'skill_learner') return 'apprenticeship';
  return null;
}

/**
 * منوی قابل‌نمایش نقش با درس‌های واقعی:
 * - ارزیابی (استاد/معلم/مدیر مدرسه): هر درس فعالِ «تعریف دروس» یک ساب‌تایتل.
 *   real: خالی، در حال بارگذاری یا خطا → فقط لینک تخت ماژول (نام ساختگی نمی‌آید)؛
 *   mock خالی → دو لینک پیش‌فرض.
 * - انتخاب واحد (دانشجو/مهارت‌آموز): هر دو حالت از «تعریف دروس». real و بدون درس
 *   (یا درس بدون سطح) → گروه انتخاب واحد نمی‌آید؛ mock خالی → منوی ایستا.
 * منوی ایستا دست‌نخورده می‌ماند (عنوان صفحه/بردکرامب از آن است).
 */
export function useSidebarMenu(role: UserRole | string | null | undefined) {
  const mock = isMockApiMode();
  const kind = learnerKind(role);
  const definitions = useActiveCourseDefinitions(
    mock || REVIEW_ROLES.has(role ?? '') || kind !== null
  );
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
    const visible = getVisibleSidebarMenu(role);
    const evaluated = withEvaluationSubModules(
      visible,
      { semester: definitions.semester, modular: definitions.modular },
      // real: هرگز نام ساختگی نشان نده؛ در خطا/بارگذاری هم فقط لینک ساده می‌ماند.
      { whenEmpty: mock ? 'defaults' : 'flat' }
    );
    if (!kind) return evaluated;

    return withEnrollmentSubModules(
      evaluated,
      learnerCourses,
      // در حالت real داده ممکن است در لحظه هنوز برنگشته باشد؛ برای جلوگیری از
      // خالی شدن کامل منوی انتخاب واحد، منوی ایستا را نگه می‌داریم.
      { whenEmpty: 'keep', ...availability }
    );
  }, [role, mock, kind, definitions, learnerCourses, availability]);
}
