'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import type { UserRole } from '@/types/auth';

import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import {
  pickRankingItems,
  type PerformanceRankingItem,
} from '../lib/performance-ranking';
import {
  facultyPerformanceQueryOptions,
  type FacultyPerformanceSnapshot,
} from './facultyPerformanceQuery';

export type ProfessorScoreRankingSummary = {
  weakest: PerformanceRankingItem[];
  strongest: PerformanceRankingItem[];
};

const EMPTY: ProfessorScoreRankingSummary = { weakest: [], strongest: [] };

export type DashboardProfessorScoreRankingState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: ProfessorScoreRankingSummary;
};

/**
 * ۶ استاد ضعیف‌ترین / ۶ استاد قوی‌ترین بر اساس میانگین نمرهٔ فراگیران —
 * `GET v1/reports/professors/performance` (`averageScore`). محدوده را بک‌اند
 * از روی کاربر لاگین‌شده (دانشکده) تعیین می‌کند. دانشگاه استانی: به‌جای اساتید،
 * دانشکده‌ها از `GET v1/reports/faculties/performance`.
 * همان کوئری مشترک ردیف‌های عملکرد را می‌خواند.
 */
export function useDashboardProfessorScoreRanking(
  role: UserRole
): DashboardProfessorScoreRankingState {
  const source = facultyBoxSourceFor(role);
  const query = useQuery({
    ...facultyPerformanceQueryOptions(source.slug),
    select: (snapshot: FacultyPerformanceSnapshot): ProfessorScoreRankingSummary => ({
      weakest: pickRankingItems(source.entity, snapshot.rows, 'weak'),
      strongest: pickRankingItems(source.entity, snapshot.rows, 'strong'),
    }),
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
