'use client';

import type { ReportSlug } from '@/types/report-access';

import { OrgReportsPageClient } from './OrgReportsPageClient';

type OrgReportsModuleProps = {
  slug: ReportSlug;
};

export function OrgReportsModule({ slug }: OrgReportsModuleProps) {
  return <OrgReportsPageClient slug={slug} />;
}
