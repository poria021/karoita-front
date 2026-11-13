'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OrganizationalCapacitiesService } from '@/services/organizational-capacities.service';
import type { OrganizationalCapacityKind } from '@/types/organizational-capacities';

import {
  buildCapacityKindStatusView,
  buildCapacityStatusInsight,
  type CapacityKindStatusView,
  type CapacityStatusInsight,
} from '../lib/capacity-status';

const CAPACITY_KINDS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly OrganizationalCapacityKind[];

export type DashboardCapacityStatusState = {
  isLoading: boolean;
  isError: boolean;
  views: CapacityKindStatusView[];
  insight: CapacityStatusInsight;
};

/**
 * خلاصهٔ ظرفیت ترمی و پودمانی برای میز کار استاد راهنما —
 * همان query keyهای صفحهٔ پیکربندی تا cache مشترک بماند.
 */
export function useDashboardCapacityStatus(): DashboardCapacityStatusState {
  const catalogQueries = useQueries({
    queries: CAPACITY_KINDS.map((kind) => ({
      queryKey: DASHBOARD_QUERY.orgCapacitiesTerms(kind),
      queryFn: () => OrganizationalCapacitiesService.loadCatalog(kind),
      staleTime: QUERY_STALE_MS.module,
    })),
  });

  const resolvedTerms = useMemo(
    () =>
      CAPACITY_KINDS.map((kind, index) => {
        const terms = catalogQueries[index]?.data?.terms ?? [];
        return {
          kind,
          termId: terms[0]?.id ?? '',
          catalog: catalogQueries[index]?.data,
        };
      }),
    [catalogQueries]
  );

  const snapshotQueries = useQueries({
    queries: resolvedTerms.map(({ kind, termId, catalog }) => ({
      queryKey: DASHBOARD_QUERY.orgCapacitiesSnapshot(kind, termId || '_'),
      queryFn: () =>
        OrganizationalCapacitiesService.getSnapshot({
          kind,
          termId,
          catalog,
        }),
      enabled: Boolean(termId),
      staleTime: QUERY_STALE_MS.module,
    })),
  });

  const catalogsPending = catalogQueries.some((query) => query.isPending);
  const catalogsError = catalogQueries.some((query) => query.isError);
  const snapshotsPending = snapshotQueries.some(
    (query, index) => Boolean(resolvedTerms[index]?.termId) && query.isPending
  );
  const snapshotsError = snapshotQueries.some((query) => query.isError);

  const catalogDataKey = catalogQueries
    .map((query) => query.dataUpdatedAt)
    .join('|');
  const snapshotDataKey = snapshotQueries
    .map((query) => query.dataUpdatedAt)
    .join('|');

  const views = useMemo(() => {
    void catalogDataKey;
    void snapshotDataKey;
    return resolvedTerms.flatMap(({ termId }, index) => {
      if (!termId) return [];
      const snapshot = snapshotQueries[index]?.data;
      if (!snapshot) return [];
      return [buildCapacityKindStatusView(snapshot)];
    });
  }, [catalogDataKey, resolvedTerms, snapshotDataKey, snapshotQueries]);

  const insight = useMemo(() => buildCapacityStatusInsight(views), [views]);

  const waitingForFirstPaint =
    (catalogsPending || snapshotsPending) && views.length === 0;

  return {
    isLoading: waitingForFirstPaint,
    isError: (catalogsError || snapshotsError) && views.length === 0,
    views,
    insight,
  };
}
