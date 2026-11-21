'use client';

import { useMemo } from 'react';

import { isForbiddenError } from '@/services/api-error';

import { orgCountsFromDashboardCounts } from '../lib/dashboard-counts';
import {
  buildOrgStructureCountMetrics,
  sumOrgStructureCounts,
  type OrgStructureCountMetric,
} from '../lib/org-structure-counts';

import { useDashboardCountsQuery } from './useDashboardCountsQuery';

export type DashboardOrgStructureCountsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  metrics: OrgStructureCountMetric[];
  total: number;
};

/**
 * شمار موجودیت‌های ساختار سازمانی برای میز کار ادمین —
 * `GET /users/dashboard/counts` (`places`)، یک درخواست سبک.
 */
export function useDashboardOrgStructureCounts(
  enabled = true
): DashboardOrgStructureCountsState {
  const query = useDashboardCountsQuery(
    orgCountsFromDashboardCounts,
    enabled
  );
  const counts = query.data;

  const metrics = useMemo(() => buildOrgStructureCountMetrics(counts), [counts]);

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    metrics,
    total: sumOrgStructureCounts(metrics),
  };
}
