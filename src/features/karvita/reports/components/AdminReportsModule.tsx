'use client';

import { AdminReportsPageClient } from '@/features/karvita/reports/components/AdminReportsPageClient';
import type { ReportSlug } from '@/types/report-access';

type AdminReportsModuleProps = {
  slug: ReportSlug;
};

export function AdminReportsModule({ slug }: AdminReportsModuleProps) {
  return <AdminReportsPageClient slug={slug} />;
}
