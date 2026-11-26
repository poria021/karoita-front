'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  canCompareOrgGrantedSlug,
  isOrgReportGranted,
  isOrgReportsRole,
  type OrgReportsRole,
} from '@/features/karvita/reports/lib/org-report-access';
import {
  isEnabledReportSlug,
  isReportSlug,
} from '@/features/karvita/reports/constants';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { ReportAccessService } from '@/services/report-access.service';
import { useUserStore } from '@/store/useUserStore';
import { isStaffAdminRole } from '@/types/role-taxonomy';
import type { ReportSlug } from '@/types/report-access';

const NO_SLUGS: readonly ReportSlug[] = [];

/**
 * منوی گزارش کاربر جاری از `GET /reports/access/me`.
 * برای نقش‌های سازمانی و ادمین/سوپرادمین زده می‌شود.
 * - `grantedSlugs`: `status=active` — منو باز، API گزارش قابل فراخوانی.
 * - `inactiveSlugs`: `status=inactive` — فقط غیرفعال نمایش بده، API گزارش را صدا نزن (۴۰۳).
 * - هر چیزی که در پاسخ نیست ممنوع است.
 * تا آماده شدن پاسخ، `grantedSlugs` برابر `null` است تا منوی ایستا فلش نزند؛
 * اگر درخواست شکست بخورد، لیست خالی می‌شود (گزارش مجاز نمایش نمی‌دهیم).
 */
export function useOrgReportAccess() {
  const activeUser = useUserStore((state) => state.activeUser);
  const role = activeUser?.role;
  const orgRole = isOrgReportsRole(role) ? (role as OrgReportsRole) : null;
  const staffRole = isStaffAdminRole(role) ? role : null;
  const accessRole = orgRole ?? staffRole;

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.reportAccessMe(accessRole ?? 'none'),
    queryFn: () => ReportAccessService.getMyAccess(),
    enabled: accessRole !== null,
    staleTime: 0,
  });

  const grantedSlugs = useMemo((): readonly ReportSlug[] | null => {
    if (!accessRole) return NO_SLUGS;
    if (query.isError) return NO_SLUGS;
    if (!query.data) return null;
    return query.data.active;
  }, [accessRole, query.data, query.isError]);

  const inactiveSlugs = query.data?.inactive ?? NO_SLUGS;
  const compareSlugs = query.data?.compare ?? NO_SLUGS;

  return {
    role: orgRole,
    isOrgRole: orgRole !== null,
    isStaffRole: staffRole !== null,
    isLoading: accessRole !== null && query.isLoading,
    isError: query.isError,
    grantedSlugs,
    inactiveSlugs,
    canAccessSlug: (slug: string) => {
      if (orgRole) return isOrgReportGranted(orgRole, slug, grantedSlugs);
      if (staffRole) {
        if (!isReportSlug(slug) || !isEnabledReportSlug(slug, staffRole)) {
          return false;
        }
        return grantedSlugs?.includes(slug) ?? false;
      }
      return false;
    },
    canCompareSlug: (slug: ReportSlug) =>
      canCompareOrgGrantedSlug(orgRole, slug, grantedSlugs, compareSlugs),
    reload: () => query.refetch(),
  };
}
