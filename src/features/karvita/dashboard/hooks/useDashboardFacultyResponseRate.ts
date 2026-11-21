'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import type { UserRole } from '@/types/auth';

import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import {
  summarizeFacultyResponseRate,
  type FacultyResponseRateSummary,
} from '../lib/faculty-response-rate';
import {
  facultyPerformanceQueryOptions,
  type FacultyPerformanceSnapshot,
} from './facultyPerformanceQuery';

const EMPTY: FacultyResponseRateSummary = {
  average: 0,
  high: 0,
  mid: 0,
  low: 0,
  total: 0,
  truncated: false,
};

export type DashboardFacultyResponseRateState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: FacultyResponseRateSummary;
};

function selectSummary(
  snapshot: FacultyPerformanceSnapshot
): FacultyResponseRateSummary {
  return summarizeFacultyResponseRate(snapshot.rows, snapshot.truncated);
}

/**
 * توزیع و میانگین نرخ پاسخ‌دهی اساتید دانشکده —
 * `GET v1/reports/professors/performance`. محدوده را بک‌اند تعیین می‌کند.
 * دانشگاه استانی: نرخ پاسخ‌دهی دانشکده‌ها از `GET v1/reports/faculties/performance`.
 * همان کوئری مشترک ردیف‌های عملکرد (رتبه‌بندی نمره/حضور) را می‌خواند.
 */
export function useDashboardFacultyResponseRate(
  role: UserRole
): DashboardFacultyResponseRateState {
  const source = facultyBoxSourceFor(role);
  const query = useQuery({
    ...facultyPerformanceQueryOptions(source.slug),
    select: selectSummary,
  });

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary: query.data ?? EMPTY,
  };
}
