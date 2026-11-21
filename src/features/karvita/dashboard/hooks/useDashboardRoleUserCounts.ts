'use client';

import { useMemo } from 'react';

import { isForbiddenError } from '@/services/api-error';

import { roleCountsFromDashboardCounts } from '../lib/dashboard-counts';
import {
  buildRoleUserCountMetrics,
  sumRoleUserCounts,
  type RoleUserCountMetric,
} from '../lib/role-user-counts';

import { useDashboardCountsQuery } from './useDashboardCountsQuery';

export type DashboardRoleUserCountsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  metrics: RoleUserCountMetric[];
  total: number;
};

/** شمار کاربران هر نقش برای میز کار ادمین — `GET /users/dashboard/counts` (`roles`). */
export function useDashboardRoleUserCounts(): DashboardRoleUserCountsState {
  const query = useDashboardCountsQuery(roleCountsFromDashboardCounts);
  const counts = query.data;

  const metrics = useMemo(() => buildRoleUserCountMetrics(counts), [counts]);

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    metrics,
    total: sumRoleUserCounts(metrics),
  };
}
