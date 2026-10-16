'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { CourseDefinition } from '@/types/syllabus-config';

export type ActiveCourseDefinitions = {
  /** `error`: خواندن ناموفق — مصرف‌کننده به منوی پیش‌فرض برمی‌گردد. */
  status: 'loading' | 'error' | 'ready';
  semester: CourseDefinition[];
  modular: CourseDefinition[];
};

const EMPTY: CourseDefinition[] = [];

/**
 * درس‌های فعال «تعریف دروس» (مدیر ارشد)، تفکیک‌شده بر اساس پنل.
 * real: `GET /v1/original-lessons`؛ mock: snapshot محلی. روی همان query key
 * صفحهٔ تعریف دروس می‌نشیند تا ویرایش ادمین فوراً سایدبار را هم به‌روز کند.
 */
export function useActiveCourseDefinitions(
  enabled = true
): ActiveCourseDefinitions {
  const mock = isMockApiMode();
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.syllabusCourseCatalog,
    queryFn: () => SyllabusConfigService.listCourseDefinitionsForConsumers(),
    enabled,
    staleTime: QUERY_STALE_MS.module,
    retry: false,
    // mock همگام است؛ بدون این، سایدبار یک لحظه منوی پیش‌فرض را نشان می‌داد.
    ...(mock
      ? {
          initialData: () => [
            ...SyllabusConfigService.getActiveCourseDefinitions('semester'),
            ...SyllabusConfigService.getActiveCourseDefinitions('modular'),
          ],
        }
      : {}),
  });

  return useMemo(() => {
    const all = query.data ?? EMPTY;
    return {
      status: query.isError ? 'error' : query.data ? 'ready' : 'loading',
      semester: all.filter((course) => course.audience === 'semester'),
      modular: all.filter((course) => course.audience === 'modular'),
    };
  }, [query.data, query.isError]);
}
