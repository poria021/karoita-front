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
import {
  findLessonForLevel,
  hasAnyEnrolmentForLevel,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { RouteService } from '@/services/route.service';
import type { InternshipEnrollmentRole } from '@/types/internship-enrollment';

/**
 * مسیرهای سطح‌های کارورزی/کارآموزی که انتخاب واحدشان بسته است.
 * یک level باز است اگر مدیر ارشد همین الان بازش کرده باشد (`status: true`)
 * *یا* دانشجو قبلاً (در هر نیم‌سالی، با هر نتیجه‌ای — قبول، رد، حتی کنسل‌شده)
 * همین level را گرفته باشد؛ چون آن‌وقت باید بتواند برگردد گزارش/تاریخچه‌اش
 * را ببیند، فارغ از اینکه الان نوبتش هست یا نه.
 * در mock همهٔ سطح‌ها باز نمایش داده می‌شوند (Set خالی).
 */
export function useInternshipLockedPaths(
  role: InternshipEnrollmentRole | null
): ReadonlySet<string> {
  const mock = isMockApiMode();
  const kind = role ? kindForRole(role) : null;
  const maxLevel = kind ? maxLevelForKind(kind) : 0;
  const enabled = Boolean(role) && !mock;

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

  return useMemo<ReadonlySet<string>>(() => {
    // تا پیش از دریافت هر دو پاسخ — قفل اضافی اعمال نمی‌شود
    if (mock || !kind || maxLevel === 0 || openQuery.isPending || bySemesterQuery.isPending) {
      return new Set();
    }
    const lessons = openQuery.data?.lessons ?? [];
    const semesters = bySemesterQuery.data ?? [];
    const locked = new Set<string>();
    for (let i = 1; i <= maxLevel; i++) {
      const level = i as 1 | 2 | 3 | 4;
      const lesson = findLessonForLevel(lessons, kind, level);
      const openedNow = Boolean(lesson) && lesson?.status === true;
      const takenBefore = hasAnyEnrolmentForLevel(semesters, kind, level);
      if (!openedNow && !takenBefore) {
        locked.add(RouteService.karvita.internshipSelection(i));
      }
    }
    return locked;
  }, [
    mock,
    kind,
    maxLevel,
    openQuery.isPending,
    openQuery.data,
    bySemesterQuery.isPending,
    bySemesterQuery.data,
  ]);
}
