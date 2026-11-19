'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import type { UserRole } from '@/types/auth';

import { dashboardTraineesQueryOptions } from './dashboardTraineesQuery';
import type { DashboardTraineesSnapshot } from '../lib/load-dashboard-trainees';
import {
  buildStudentGradesList,
  type StudentGradeListItem,
} from '../lib/student-grades-list';

export type DashboardStudentGradesListState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  items: StudentGradeListItem[];
};

const EMPTY: StudentGradeListItem[] = [];

function selectGrades(snapshot: DashboardTraineesSnapshot): StudentGradeListItem[] {
  return buildStudentGradesList(snapshot.trainees);
}

/**
 * نمرهٔ نهایی همهٔ فراگیران استاد راهنما. همان query مشترکِ فراگیرانِ میز کار
 * (باکس تعداد فراگیران / برترین‌ها) را می‌خواند؛ درخواست اضافه نمی‌زند.
 */
export function useDashboardStudentGradesList(
  role: UserRole
): DashboardStudentGradesListState {
  const query = useQuery({
    ...dashboardTraineesQueryOptions(role),
    select: selectGrades,
  });

  return {
    isLoading: query.isPending,
    isError: query.isError,
    isForbidden: isForbiddenError(query.error),
    items: query.data ?? EMPTY,
  };
}
