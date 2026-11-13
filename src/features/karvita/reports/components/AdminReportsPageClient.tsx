'use client';

import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import type { ReportSlug } from '@/types/report-access';

import { ReportsPageView } from './ReportsPageView';

type AdminReportsPageClientProps = {
  slug: ReportSlug;
};

export function AdminReportsPageClient({ slug }: AdminReportsPageClientProps) {
  return (
    <SuperAdminModuleGuard>
      <ReportsPageView slug={slug} showCategoryNav />
    </SuperAdminModuleGuard>
  );
}
