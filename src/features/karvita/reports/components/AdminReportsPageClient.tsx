'use client';

import { useMemo } from 'react';

import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import {
  extraReportFilterKeysForRole,
  hiddenReportFilterKeysForRole,
} from '@/features/karvita/reports/lib/org-report-access';
import { useUserStore } from '@/store/useUserStore';
import type { ReportSlug } from '@/types/report-access';

import { ReportsPageView } from './ReportsPageView';

type AdminReportsPageClientProps = {
  slug: ReportSlug;
};

export function AdminReportsPageClient({ slug }: AdminReportsPageClientProps) {
  const role = useUserStore((state) => state.activeUser?.role);
  const pageOptions = useMemo(
    () => ({
      hiddenFilterKeys: hiddenReportFilterKeysForRole(role, slug),
      extraFilterKeys: extraReportFilterKeysForRole(role, slug),
    }),
    [role, slug]
  );

  return (
    <SuperAdminModuleGuard>
      <ReportsPageView
        slug={slug}
        showCategoryNav
        pageOptions={pageOptions}
      />
    </SuperAdminModuleGuard>
  );
}
