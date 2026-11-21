'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useMemo } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SyllabusConfigService } from '@/services/syllabus-config.service';

import {
  buildCurrentTermView,
  kindsForRole,
  pickCurrentSemester,
  type CurrentTermView,
} from '../lib/current-terms';
import { loadAllSemesters } from './useCurrentTerms';

export type DashboardTermOfferingsRow = {
  view: CurrentTermView;
  /** تعداد ارائه‌های فعال؛ `null` = داده‌اش نیامده. */
  offered: number | null;
  /** کل درس‌های همین نیم‌سال؛ `null` = داده‌اش نیامده. */
  total: number | null;
};

export type DashboardTermOfferingsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  rows: DashboardTermOfferingsRow[];
};

/** مدیر ارشد هر دو نوع نیم‌سال (ترمی و پودمان) را می‌بیند. */
const KINDS = kindsForRole('super_admin');

/**
 * نیم‌سال جاری هر نوع + تعداد ارائه‌های فعال آن، برای میز کار ادمین.
 * نیم‌سال‌ها هم‌کلید `useCurrentTerms`اند (درخواست اضافه نمی‌خورد)؛ ارائه‌ها از
 * `SyllabusConfigService.listOfferings`. خطای ارائه‌ها فقط عدد را خالی می‌کند.
 */
export function useDashboardTermOfferings(): DashboardTermOfferingsState {
  const mock = isMockApiMode();

  const semesters = useQuery({
    queryKey: DASHBOARD_QUERY.currentTerms,
    queryFn: loadAllSemesters,
    enabled: !mock,
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });

  const picked = useMemo(
    () =>
      semesters.data
        ? KINDS.map((kind) => ({
            kind,
            semester: pickCurrentSemester(semesters.data, kind),
          }))
        : [],
    [semesters.data]
  );

  const offerings = useQueries({
    queries: picked.map(({ kind, semester }) => ({
      queryKey: [
        'syllabus-config',
        'dashboard-offerings',
        kind,
        semester?.id ?? '',
      ],
      enabled: Boolean(semester),
      staleTime: QUERY_STALE_MS.module,
      retry: false,
      queryFn: () => SyllabusConfigService.listOfferings(semester!.id),
    })),
  });

  const rows = useMemo<DashboardTermOfferingsRow[]>(
    () =>
      picked.map(({ kind, semester }, index) => {
        const list = offerings[index]?.data;
        return {
          view: buildCurrentTermView(kind, semester),
          offered: list ? list.filter((item) => item.isOffered).length : null,
          total: list ? list.length : null,
        };
      }),
    [offerings, picked]
  );

  return {
    isLoading: !mock && semesters.isPending,
    isError: mock || (semesters.isError && !semesters.data),
    isForbidden: !mock && isForbiddenError(semesters.error),
    rows,
  };
}
