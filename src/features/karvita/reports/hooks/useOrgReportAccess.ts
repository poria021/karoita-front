'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  canAccessOrgReportSlug,
  canCompareOrgReportSlug,
  grantedOrgReportSlugs,
  isOrgReportsRole,
  resolveOrgUserProvinceIds,
  type OrgReportsRole,
} from '@/features/karvita/reports/lib/org-report-access';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { ReportAccessService } from '@/services/report-access.service';
import { useUserStore } from '@/store/useUserStore';
import type { ReportSlug } from '@/types/report-access';

/**
 * ماتریس دسترسی گزارش‌ها برای نقش سازمانی جاری.
 * تا آماده شدن snapshot، `grantedSlugs` برابر `null` است تا منوی ایستا فلش نزند.
 */
export function useOrgReportAccess() {
  const activeUser = useUserStore((state) => state.activeUser);
  const role = activeUser?.role;
  const orgRole = isOrgReportsRole(role) ? (role as OrgReportsRole) : null;

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.reportAccessSnapshot,
    queryFn: () => ReportAccessService.getSnapshot(),
    enabled: orgRole !== null,
    staleTime: 30_000,
  });

  const userProvinceIds = useMemo(() => {
    if (!query.data) return [] as string[];
    return resolveOrgUserProvinceIds(
      activeUser?.province,
      query.data.provinceNames
    );
  }, [activeUser?.province, query.data]);

  const grantedSlugs = useMemo((): ReportSlug[] | null => {
    if (!orgRole) return [];
    if (!query.data) return null;
    return grantedOrgReportSlugs(
      orgRole,
      query.data.matrix,
      userProvinceIds
    );
  }, [orgRole, query.data, userProvinceIds]);

  const matrix = query.data?.matrix ?? null;

  return {
    role: orgRole,
    isOrgRole: orgRole !== null,
    isLoading: orgRole !== null && query.isLoading,
    isError: query.isError,
    matrix,
    userProvinceIds,
    grantedSlugs,
    canAccessSlug: (slug: string) =>
      canAccessOrgReportSlug(orgRole, slug, matrix, userProvinceIds),
    canCompareSlug: (slug: ReportSlug) =>
      canCompareOrgReportSlug(orgRole, slug, matrix, userProvinceIds),
    reload: () => query.refetch(),
  };
}
