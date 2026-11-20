'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import type { UserRole } from '@/types/auth';

import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import {
  buildProfessorAttendanceRanking,
  type ProfessorAttendanceRankingSummary,
} from '../lib/professor-attendance-ranking';
import {
  facultyPerformanceQueryOptions,
  type FacultyPerformanceSnapshot,
} from './facultyPerformanceQuery';

const EMPTY: ProfessorAttendanceRankingSummary = {
  weakest: [],
  strongest: [],
};

export type DashboardProfessorAttendanceRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: ProfessorAttendanceRankingSummary;
};

function selectRanking(
  snapshot: FacultyPerformanceSnapshot
): ProfessorAttendanceRankingSummary {
  return buildProfessorAttendanceRanking(snapshot.rows);
}

/**
 * ضعیف‌ترین / قوی‌ترین اساتید دانشکده بر اساس درصد حضور —
 * `GET v1/reports/professors/performance` (`attendancePercent`).
 * همان کوئری مشترک ردیف‌های عملکرد را می‌خواند.
 */
export function useDashboardProfessorAttendanceRanking(
  role: UserRole
): DashboardProfessorAttendanceRankingState {
  const source = facultyBoxSourceFor(role);
  const query = useQuery({
    ...facultyPerformanceQueryOptions(source.slug),
    select: selectRanking,
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
