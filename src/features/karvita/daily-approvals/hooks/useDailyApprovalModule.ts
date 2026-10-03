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
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';
import { EVALUATION_MODULE_PARAM } from '@/utils/role-strategy/evaluation-menu';

/**
 * درس انتخاب‌شدهٔ ماژول ارزیابی (`?module=`): لینک ساب‌تایتل سایدبار همین پارامتر را می‌گذارد.
 * نبودن یا ناشناخته بودنش = اولین درس فعال همان پنل و URL هم‌گام می‌شود.
 * بدون درس داینامیک (real) درس انتخابی همیشه `null` است و صفحه مثل قبل کار می‌کند.
 * نوشتن از `window.location` تازه می‌خواند تا بعد از `setKind` پارامتر `kind` را زیر پا نگذارد.
 */
export function useDailyApprovalModule(kind: DailyApprovalCourseKind) {
  const pathname = usePathname();
  const search = useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );

  const courses = useMemo<CourseDefinition[]>(
    () =>
      SyllabusConfigService.getActiveCourseDefinitions(
        kind === 'internship' ? 'semester' : 'modular'
      ),
    [kind]
  );

  /** با درس داینامیک هر درس خودش پنل را مشخص می‌کند؛ تب نوع دوره فقط وقتی لازم است که فهرستی نباشد. */
  const hasDynamicCourses = useMemo(
    () =>
      SyllabusConfigService.getActiveCourseDefinitions('semester').length > 0 ||
      SyllabusConfigService.getActiveCourseDefinitions('modular').length > 0,
    []
  );

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

  return { courseModule, courses, hasDynamicCourses, setModuleId: writeModule };
}
