import { notFound } from 'next/navigation';

import { OrgReportsModule } from '@/features/karvita/reports/components/OrgReportsModule';
import {
  isReportSlug,
  REPORT_PAGE_DEFS,
} from '@/features/karvita/reports/constants';
import { allOrgRoutableReportSlugs } from '@/features/karvita/reports/lib/org-report-access';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const ORG_ROUTABLE_SLUGS = new Set<string>(allOrgRoutableReportSlugs());

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isReportSlug(slug) || !ORG_ROUTABLE_SLUGS.has(slug)) {
    return { title: 'گزارش‌گیری', robots: { index: false, follow: false } };
  }
  const def = REPORT_PAGE_DEFS[slug];
  return {
    title: def.title,
    description: def.desc.term,
    robots: { index: false, follow: false },
  };
}

export default async function OrgReportSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isReportSlug(slug) || !ORG_ROUTABLE_SLUGS.has(slug)) notFound();
  return <OrgReportsModule slug={slug} />;
}
