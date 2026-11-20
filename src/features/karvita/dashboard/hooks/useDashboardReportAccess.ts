'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useMemo } from 'react';

import { withCatalogOptionalReports } from '@/features/karvita/report-access/lib/with-catalog-optionals';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { ReportAccessService } from '@/services/report-access.service';

import {
  buildReportAccessMatrix,
  type ReportAccessMatrixView,
} from '../lib/report-access-matrix';
import {
  summarizeReportAccess,
  type ReportAccessRoleSummary,
} from '../lib/report-access-summary';

export type DashboardReportAccessState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  roles: ReportAccessRoleSummary[];
  /** ماتریس «نقش × گزارش» برای باکس میز کار. */
  matrix: ReportAccessMatrixView;
};

/**
 * خلاصهٔ دسترسی گزارش‌ها به تفکیک نقش برای میز کار ادمین —
 * `GET /reports/access`. زیر پیشوند `report-access` است تا بعد از تغییر سوییچ
 * در صفحهٔ مدیریت دسترسی خودکار باطل شود.
 */
export function useDashboardReportAccess(): DashboardReportAccessState {
  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.reportAccess, 'dashboard-summary'],
    queryFn: async () =>
      withCatalogOptionalReports(await ReportAccessService.getMatrix()),
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });

  const roles = useMemo(
    () => (query.data ? summarizeReportAccess(query.data) : []),
    [query.data]
  );

  const matrix = useMemo(
    () => buildReportAccessMatrix(query.data ?? []),
    [query.data]
  );

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    roles,
    matrix,
  };
}
