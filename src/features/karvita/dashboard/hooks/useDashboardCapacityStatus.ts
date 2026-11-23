'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OrganizationalCapacitiesService } from '@/services/organizational-capacities.service';
import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityKind,
} from '@/types/organizational-capacities';

import { pickCapacityTermId } from '../lib/capacity-term';
import { loadAllSemesters } from './useCurrentTerms';

const CAPACITY_KINDS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly OrganizationalCapacityKind[];

/** ظرفیت ترمی ↔ ساختار `semester`، پودمانی ↔ `podmani` در ترم جاری. */
const TERM_KIND_BY_CAPACITY_KIND = {
  internship: 'semester',
  apprenticeship: 'podmani',
} as const satisfies Record<OrganizationalCapacityKind, 'semester' | 'podmani'>;

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
 *
 * ترمِ مبنا «آخرین نیم‌سال فعال» است (کلاس‌ها شروع شده > انتخاب واحد باز)،
 * با همان قاعده و همان cache باکس خوش‌آمد (`DASHBOARD_QUERY.currentTerms`).
 */
export function useDashboardCapacityStatus(): DashboardCapacityStatusState {
  const mock = isMockApiMode();

  const catalogQueries = useQueries({
    queries: CAPACITY_KINDS.map((kind) => ({
      queryKey: DASHBOARD_QUERY.orgCapacitiesTerms(kind),
      queryFn: () => OrganizationalCapacitiesService.loadCatalog(kind),
      staleTime: QUERY_STALE_MS.module,
    })),
  });

  // فهرست نیم‌سال‌ها با پرچم‌های `startClasses` / `courseSelection`؛
  // در mock این پرچم‌ها وجود ندارند، پس نیازی به درخواست نیست.
  const semestersQuery = useQuery({
    queryKey: DASHBOARD_QUERY.currentTerms,
    queryFn: loadAllSemesters,
    enabled: !mock,
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });
  // تا تعیین ترم جاری snapshot نمی‌خوانیم؛ وگرنه اول ترم اشتباه می‌آید و بعد جابه‌جا می‌شود.
  const semestersPending = !mock && semestersQuery.isPending;
  const semesters = semestersQuery.data;

  const resolvedTerms = useMemo(
    () =>
      CAPACITY_KINDS.map((kind, index) => {
        const terms = catalogQueries[index]?.data?.terms ?? [];
        return {
          kind,
          termId: semestersPending
            ? ''
            : pickCapacityTermId({
                terms,
                semesters,
                kind: TERM_KIND_BY_CAPACITY_KIND[kind],
                fallback: mock ? 'first' : 'last',
              }),
          catalog: catalogQueries[index]?.data,
        };
      }),
    [catalogQueries, mock, semesters, semestersPending]
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
    isLoading:
      (catalogsPending || semestersPending || snapshotsPending) &&
      snapshots.length === 0,
    isError: (catalogsError || snapshotsError) && snapshots.length === 0,
    isForbidden:
      [...catalogQueries, ...snapshotQueries].some((query) =>
        isForbiddenError(query.error)
      ) && snapshots.length === 0,
    snapshots,
  };
}
