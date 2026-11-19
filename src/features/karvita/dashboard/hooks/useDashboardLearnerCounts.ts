'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import type { UserRole } from '@/types/auth';

import { buildLearnerCounts, type LearnerCountsSummary } from '../lib/learner-counts';
import type { DashboardTraineesSnapshot } from '../lib/load-dashboard-trainees';
import { dashboardTraineesQueryOptions } from './dashboardTraineesQuery';

export type DashboardLearnerCountsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  counts: LearnerCountsSummary | null;
};

function selectLearnerCounts(
  snapshot: DashboardTraineesSnapshot
): LearnerCountsSummary {
  return buildLearnerCounts(snapshot.trainees, snapshot.truncated);
}

/**
 * شمار دانشجویان / مهارت‌آموزان / معلمان برای میز کار استاد راهنما، معلم راهنما
 * و مدیر مدرسه. باکس فراگیران، باکس معلمان و باکس میانگین نمرهٔ دروس یک query
 * key را مشترک می‌خوانند، پس فقط یک بار از سرور بارگذاری می‌شود.
 */
export function useDashboardLearnerCounts(
  role: UserRole
): DashboardLearnerCountsState {
  const query = useQuery({
    ...dashboardTraineesQueryOptions(role),
    select: selectLearnerCounts,
  });

  return {
    isLoading: query.isPending,
    isError: query.isError,
    isForbidden: isForbiddenError(query.error),
    counts: query.data ?? null,
  };
}
