'use client';

import { useQueries } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OrganizationalCapacitiesService } from '@/services/organizational-capacities.service';
import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityKind,
} from '@/types/organizational-capacities';

const CAPACITY_KINDS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly OrganizationalCapacityKind[];

export type DashboardCapacityStatusState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  /** snapshot ترم جاری هر مسیر (ترمی/پودمانی) — برای ظرفیت هر درس. */
  snapshots: OrganizationalCapacitiesSnapshot[];
};

/**
 * snapshot ظرفیت ترمی و پودمانی برای میز کار استاد راهنما —
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

  const snapshotDataKey = snapshotQueries
    .map((query) => query.dataUpdatedAt)
    .join('|');

  const snapshots = useMemo(() => {
    void snapshotDataKey;
    return snapshotQueries.flatMap((query) => (query.data ? [query.data] : []));
  }, [snapshotDataKey, snapshotQueries]);

  return {
    isLoading: (catalogsPending || snapshotsPending) && snapshots.length === 0,
    isError: (catalogsError || snapshotsError) && snapshots.length === 0,
    isForbidden:
      [...catalogQueries, ...snapshotQueries].some((query) =>
        isForbiddenError(query.error)
      ) && snapshots.length === 0,
    snapshots,
  };
}
