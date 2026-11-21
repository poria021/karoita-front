'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import type { UserRole } from '@/types/auth';

import {
  canLoadDashboardTrainees,
  dashboardTraineesQueryOptions,
} from './dashboardTraineesQuery';
import type { DashboardTraineesSnapshot } from '../lib/load-dashboard-trainees';
import {
  buildStudentGradeRanking,
  type StudentGradeRankingSummary,
} from '../lib/student-grade-ranking';

export type DashboardStudentGradeRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: StudentGradeRankingSummary;
};

const EMPTY: StudentGradeRankingSummary = { weakest: [], strongest: [] };

function selectRanking(
  snapshot: DashboardTraineesSnapshot
): StudentGradeRankingSummary {
  return buildStudentGradeRanking(snapshot.trainees);
}

/**
 * ۶ فراگیر ضعیف‌ترین / ۶ فراگیر قوی‌ترین بر اساس نمرهٔ نهایی — برای میز کار
 * استاد راهنما. همان query فراگیرانِ باکس «تعداد فراگیران» را می‌خواند؛
 * درخواست اضافه نمی‌زند.
 */
export function useDashboardStudentGradeRanking(
  role: UserRole
): DashboardStudentGradeRankingState {
  const allowed = canLoadDashboardTrainees(role);
  const query = useQuery({
    ...dashboardTraineesQueryOptions(role),
    select: selectRanking,
  });

  if (!allowed) {
    return {
      isLoading: false,
      isError: false,
      isForbidden: false,
      summary: EMPTY,
    };
  }

  return {
    isLoading: query.isPending,
    isError: query.isError,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
