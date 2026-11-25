'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { parseNestSemesterList } from '@/services/syllabus-config/real/mappers/nest-raw-parsers';
import type { UserRole } from '@/types/auth';
import type { NestSemester } from '@/types/nest-admin';

import {
  buildCurrentTermView,
  kindsForRole,
  pickCurrentSemester,
  semesterKind,
  type CurrentTermView,
} from '../lib/current-terms';

export type CurrentTermsState = {
  isLoading: boolean;
  /** برای فراگیر ۱ مورد (ترمی یا پودمان)، برای بقیه ۲ مورد. خالی = داده‌ای نیست. */
  views: CurrentTermView[];
};

function isLearnerRole(role: UserRole | undefined): boolean {
  return role === 'student' || role === 'skill_learner';
}

/**
 * پنل‌های غیر فراگیر: `GET /admin/semester` (گیت‌ها روی هر ردیف).
 * اگر این مسیر برای نقش بسته بود، `semesters_all` — بدون گیت؛ آخرین ردیف هر نوع.
 */
export async function loadAllSemesters(): Promise<NestSemester[]> {
  try {
    return parseNestSemesterList(await adminCatalogApi.listSemesters());
  } catch {
    const [terms, modules] = await Promise.all([
      adminCatalogApi.listSemestersAll('semester'),
      adminCatalogApi.listSemestersAll('podmani'),
    ]);
    return [
      ...terms.map((item) => ({ ...item, structure: 'semester' as const })),
      ...modules.map((item) => ({ ...item, structure: 'podmani' as const })),
    ];
  }
}

/**
 * نیم‌سال جاری میز کار:
 * - دانشجو → ترمی، مهارت‌آموز → پودمان؛ از `open-course-selection` (همان کش صفحهٔ درس).
 * - بقیهٔ پنل‌ها → هر دو نوع.
 * حالت mock: داده‌ای نمی‌دهد و باکس‌ها نمایش داده نمی‌شوند.
 */
export function useCurrentTerms(role: UserRole | undefined): CurrentTermsState {
  const mock = isMockApiMode();
  const learner = isLearnerRole(role);
  const enabled = Boolean(role) && !mock;

  const openQuery = useQuery({
    // هم‌کلید با `useEnrollmentLeafAvailability` تا درخواست اضافه نخورد.
    queryKey: [...DASHBOARD_QUERY.internshipEnrollment, 'open-course-selection'],
    queryFn: () => studentEnrollmentsApi.getOpenCourseSelection(),
    enabled: enabled && learner,
    staleTime: QUERY_STALE_MS.enrollment,
    retry: false,
  });

  const listQuery = useQuery({
    queryKey: DASHBOARD_QUERY.currentTerms,
    queryFn: loadAllSemesters,
    enabled: enabled && !learner,
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });

  const views = useMemo<CurrentTermView[]>(() => {
    if (!role || mock) return [];
    const kinds = kindsForRole(role);

    if (learner) {
      if (openQuery.isError || openQuery.data === undefined) return [];
      const open = openQuery.data;
      return kinds.map((kind) =>
        open && semesterKind(open) === kind
          ? buildCurrentTermView(kind, open, open.lessons.length)
          : buildCurrentTermView(kind, null)
      );
    }

    if (!listQuery.data) return [];
    return kinds.map((kind) =>
      buildCurrentTermView(kind, pickCurrentSemester(listQuery.data, kind))
    );
  }, [learner, listQuery.data, mock, openQuery.data, openQuery.isError, role]);

  const isLoading = enabled && (learner ? openQuery.isPending : listQuery.isPending);

  return { isLoading, views };
}
