'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import type { LessonReportFilter } from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';

import { currentSemesterReportFilters } from '../lib/report-semester-filters';
import { loadAllSemesters } from './useCurrentTerms';

const UNFILTERED: LessonReportFilter[] = [{}];

export type ReportSemesterFiltersState = {
  /** ترم‌های جاری هنوز مشخص نشده‌اند؛ تا آن موقع گزارشی نخوانیم. */
  isPending: boolean;
  /** فهرست نیم‌سال‌ها خوانده نشد؛ ترم جاری معلوم نیست. */
  isError: boolean;
  /** هر فیلتر یک درخواست؛ خالی = ترم جاری‌ای نیست (حالت خالی، نه «همه»). */
  filters: LessonReportFilter[];
};

/**
 * ترمِ درخواست‌های گزارش درس. سرور بدون `semesterId` همهٔ نیم‌سال‌ها را جمع می‌زند،
 * پس مگر آنکه فیلتر صریح داده شود، ترم جاری هر مسیر (ترمی/پودمانی) را می‌فرستیم؛
 * فهرست نیم‌سال‌ها با کش `currentTerms` باکس خوش‌آمد مشترک است.
 * در mock فیلتر نمی‌فرستیم (پرچم ترم در mock نیست).
 */
export function useReportSemesterFilters(
  role: UserRole,
  explicit: LessonReportFilter = {}
): ReportSemesterFiltersState {
  const mock = isMockApiMode();
  const hasExplicit = Boolean(explicit.semesterId || explicit.structure);

  const semestersQuery = useQuery({
    queryKey: DASHBOARD_QUERY.currentTerms,
    queryFn: loadAllSemesters,
    enabled: !mock && !hasExplicit,
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });

  const semesters = semestersQuery.data;
  const explicitSemesterId = explicit.semesterId;
  const explicitStructure = explicit.structure;

  const filters = useMemo<LessonReportFilter[]>(() => {
    if (hasExplicit) {
      return [{ semesterId: explicitSemesterId, structure: explicitStructure }];
    }
    if (mock) return UNFILTERED;
    return semesters ? currentSemesterReportFilters(semesters, role) : [];
  }, [explicitSemesterId, explicitStructure, hasExplicit, mock, role, semesters]);

  return {
    isPending: !mock && !hasExplicit && semestersQuery.isPending,
    isError: !mock && !hasExplicit && semestersQuery.isError,
    filters,
  };
}
