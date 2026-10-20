'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { kindForRole } from '@/services/internship-enrollment/enrollment-mappers';
import {
  enrolledLevelsFromSemesters,
  openLevelsFromLessons,
  type EnrollmentLeafRef,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { useUserStore } from '@/store/useUserStore';
import type { InternshipEnrollmentRole } from '@/types/internship-enrollment';

export type EnrollmentLeafAvailability = {
  /**
   * سطح‌هایی که همین الان در ترم جاری ارائه (سرفصل) شده‌اند.
   * `null` یعنی هنوز نامعلوم (در حال بارگذاری / کاربر یادگیرنده نیست)؛ تا آن موقع
   * منو بر اساس ارائه قفل نمی‌شود تا آیتم باز یک‌دفعه بسته نشود.
   */
  offeredLevels: ReadonlySet<number> | null;
  /** سطح‌هایی که کاربر قبلاً (هر ترم، هر نتیجه‌ای — قبول، رد، حتی لغوشده) در آن‌ها ثبت‌نام داشته. */
  enrolledLevels: ReadonlySet<number>;
};

const NO_LEVELS: ReadonlySet<number> = new Set();
const UNKNOWN: EnrollmentLeafAvailability = {
  offeredLevels: null,
  enrolledLevels: NO_LEVELS,
};

/**
 * وضعیت ارائه + سابقهٔ ثبت‌نام برای آیتم‌های «انتخاب واحد» منوی دانشجو/مهارت‌آموز.
 * قاعده (در `withEnrollmentSubModules`): درسی که در «تعریف دروس» غیرفعال است یا
 * در ترم جاری ارائه نشده، غیرفعال می‌شود — مگر اینکه کاربر قبلاً آن را برداشته باشد.
 *
 * real: همان دو query مشترک با `useInternshipLockedPaths` (`open-course-selection`
 * و `by-semester`)، پس درخواست اضافه‌ای نمی‌زند. mock: snapshot محلی از طریق فاساد.
 */
export function useEnrollmentLeafAvailability(
  role: InternshipEnrollmentRole | null,
  leaves: readonly EnrollmentLeafRef[]
): EnrollmentLeafAvailability {
  const mock = isMockApiMode();
  const userId = useUserStore((state) => state.activeUser?.id ?? null);
  const kind = role ? kindForRole(role) : null;
  const hasLeaves = leaves.length > 0;
  const enabled = kind !== null && hasLeaves;

  const openQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'open-course-selection'],
    queryFn: () => studentEnrollmentsApi.getOpenCourseSelection(),
    enabled: enabled && !mock,
    staleTime: QUERY_STALE_MS.module,
  });
  const bySemesterQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'by-semester'],
    queryFn: () => studentEnrollmentsApi.listBySemester(),
    enabled: enabled && !mock,
    staleTime: QUERY_STALE_MS.module,
  });

  const levelsKey = leaves.map((leaf) => leaf.level).join(',');
  const mockQuery = useQuery({
    queryKey: [
      ...DASHBOARD_QUERY.internshipEnrollment,
      'mock-leaf-availability',
      userId,
      kind,
      levelsKey,
    ],
    queryFn: async () => {
      if (!userId || !kind) return { offered: [], enrolled: [] };
      return InternshipEnrollmentService.getLeafAvailability({
        userId,
        kind,
        levels: leaves.map((leaf) => leaf.level),
      });
    },
    enabled: enabled && mock && Boolean(userId),
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });

  return useMemo<EnrollmentLeafAvailability>(() => {
    if (!kind || !hasLeaves) return UNKNOWN;

    if (mock) {
      const data = mockQuery.data;
      if (!data) return UNKNOWN;
      return {
        offeredLevels: new Set(data.offered),
        enrolledLevels: new Set(data.enrolled),
      };
    }

    // تا پیش از دریافت هر دو پاسخ — قفل اضافی اعمال نمی‌شود (مثل useInternshipLockedPaths).
    if (openQuery.isPending || bySemesterQuery.isPending) return UNKNOWN;
    return {
      offeredLevels: openLevelsFromLessons(
        openQuery.data?.lessons ?? [],
        kind,
        leaves
      ),
      enrolledLevels: enrolledLevelsFromSemesters(
        bySemesterQuery.data ?? [],
        kind,
        leaves
      ),
    };
  }, [
    kind,
    hasLeaves,
    leaves,
    mock,
    mockQuery.data,
    openQuery.isPending,
    openQuery.data,
    bySemesterQuery.isPending,
    bySemesterQuery.data,
  ]);
}
