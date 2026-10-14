'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { isMockApiMode } from '@/lib/api-mode';
import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
import type { UserRole } from '@/types/auth';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import { getVisibleSidebarMenu } from '@/utils/RoleStrategyMap';
import { withEnrollmentSubModules } from '@/utils/role-strategy/enrollment-menu';
import { withEvaluationSubModules } from '@/utils/role-strategy/evaluation-menu';

import { useEnrollableLessonCourses } from './useEnrollableLessonCourses';

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
 *   real و خالی → فقط لینک تخت ماژول؛ خطای API → دو لینک پیش‌فرض.
 * - انتخاب واحد (دانشجو/مهارت‌آموز): mock از «تعریف دروس»؛ real از lessonهای
 *   واقعی ترم (Nest هنوز درس ترم را به تعریف دروس وصل نکرده). هیچ درسی → گروه
 *   حذف؛ خطا یا در حال بارگذاری → منوی ایستا تا ناوبری قطع نشود.
 * منوی ایستا دست‌نخورده می‌ماند (عنوان صفحه/بردکرامب از آن است).
 */
export function useSidebarMenu(role: UserRole | string | null | undefined) {
  const mock = isMockApiMode();
  const kind = learnerKind(role);
  const definitions = useActiveCourseDefinitions(
    mock || REVIEW_ROLES.has(role ?? '')
  );
  const enrollable = useEnrollableLessonCourses(mock ? null : kind);

  return useMemo(() => {
    const visible = getVisibleSidebarMenu(role);
    const evaluated = withEvaluationSubModules(
      visible,
      { semester: definitions.semester, modular: definitions.modular },
      { whenEmpty: !mock && definitions.status === 'ready' ? 'flat' : 'defaults' }
    );
    if (!kind) return evaluated;

    if (mock) {
      return withEnrollmentSubModules(
        evaluated,
        kind === 'internship' ? definitions.semester : definitions.modular
      );
    }
    return withEnrollmentSubModules(evaluated, enrollable.courses, {
      whenEmpty: enrollable.status === 'ready' ? 'remove' : 'keep',
    });
  }, [role, mock, kind, definitions, enrollable]);
}
