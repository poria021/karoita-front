'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OrgStructureService } from '@/services/org-structure.service';

import {
  buildOrgStructureCountMetrics,
  sumOrgStructureCounts,
  type OrgStructureCountMetric,
} from '../lib/org-structure-counts';

export type DashboardOrgStructureCountsState = {
  isLoading: boolean;
  isError: boolean;
  metrics: OrgStructureCountMetric[];
  total: number;
};

/**
 * شمار موجودیت‌های ساختار سازمانی برای میز کار مدیر ارشد —
 * از همان snapshot سرویس ساختار سازمانی.
 */
export function useDashboardOrgStructureCounts(): DashboardOrgStructureCountsState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.orgStructureDashboardCounts,
    queryFn: () => OrgStructureService.getSnapshot(),
    staleTime: QUERY_STALE_MS.module,
  });

  const metrics = useMemo(
    () => buildOrgStructureCountMetrics(query.data),
    [query.data]
  );

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    metrics,
    total: sumOrgStructureCounts(metrics),
  };
}
