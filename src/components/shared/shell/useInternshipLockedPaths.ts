'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  kindForRole,
  maxLevelForKind,
} from '@/services/internship-enrollment/enrollment-mappers';
import { findLessonForLevel } from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { RouteService } from '@/services/route.service';
import type { InternshipEnrollmentRole } from '@/types/internship-enrollment';

/**
 * مسیرهای سطح‌های کارورزی/کارآموزی که انتخاب واحدشان بسته است.
 * در mock همهٔ سطح‌ها باز نمایش داده می‌شوند (Set خالی).
 */
export function useInternshipLockedPaths(
  role: InternshipEnrollmentRole | null
): ReadonlySet<string> {
  const mock = isMockApiMode();
  const kind = role ? kindForRole(role) : null;
  const maxLevel = kind ? maxLevelForKind(kind) : 0;

  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'open-course-selection'],
    queryFn: () => studentEnrollmentsApi.getOpenCourseSelection(),
    enabled: Boolean(role) && !mock,
    staleTime: QUERY_STALE_MS.module,
  });

  return useMemo<ReadonlySet<string>>(() => {
    // تا پیش از دریافت پاسخ — قفل اضافی اعمال نمی‌شود
    if (mock || !kind || maxLevel === 0 || query.isPending) return new Set();
    const lessons = query.data?.lessons ?? [];
    const locked = new Set<string>();
    for (let i = 1; i <= maxLevel; i++) {
      const lesson = findLessonForLevel(lessons, kind, i as 1 | 2 | 3 | 4);
      if (!lesson || lesson.courseSelection === false) {
        locked.add(RouteService.karvita.internshipSelection(i));
      }
    }
    return locked;
  }, [mock, kind, maxLevel, query.isPending, query.data]);
}
