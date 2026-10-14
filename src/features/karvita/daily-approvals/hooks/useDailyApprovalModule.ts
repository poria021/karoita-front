'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

import { hrefWithSearchParam } from '@/lib/dashboard-url-state';
import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  replaceShallowHref,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';
import { EVALUATION_MODULE_PARAM } from '@/utils/role-strategy/evaluation-menu';

/**
 * درس انتخاب‌شدهٔ ماژول ارزیابی (`?module=`): لینک ساب‌تایتل سایدبار همین پارامتر را می‌گذارد.
 * نبودن یا ناشناخته بودنش = اولین درس فعال همان پنل و URL هم‌گام می‌شود.
 * درس‌ها از «تعریف دروس» می‌آیند (real: `original-lessons`)؛ بدون درس، انتخابی `null` است.
 * نوشتن از `window.location` تازه می‌خواند تا بعد از `setKind` پارامتر `kind` را زیر پا نگذارد.
 */
export function useDailyApprovalModule(kind: DailyApprovalCourseKind) {
  const pathname = usePathname();
  const search = useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );

  const definitions = useActiveCourseDefinitions();
  const courses: CourseDefinition[] =
    kind === 'internship' ? definitions.semester : definitions.modular;

  const raw = useMemo(
    () => new URLSearchParams(search).get(EVALUATION_MODULE_PARAM),
    [search]
  );
  const courseModule = useMemo(
    () => courses.find((course) => course.id === raw) ?? courses[0] ?? null,
    [courses, raw]
  );

  const writeModule = useCallback(
    (id: string | null) => {
      if (typeof window === 'undefined') return;
      if (window.location.pathname !== pathname) return;
      replaceShallowHref(
        hrefWithSearchParam(
          pathname,
          new URLSearchParams(window.location.search),
          EVALUATION_MODULE_PARAM,
          id
        )
      );
    },
    [pathname]
  );

  useEffect(() => {
    if (courseModule && raw !== courseModule.id) writeModule(courseModule.id);
  }, [courseModule, raw, writeModule]);

  return { courseModule, courses, setModuleId: writeModule };
}
