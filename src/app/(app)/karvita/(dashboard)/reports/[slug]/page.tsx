import { notFound, redirect } from 'next/navigation';

import { OrgReportsModule } from '@/features/karvita/reports/components/OrgReportsModule';
import {
  isReportSlug,
  REPORT_COMPARE_ENABLED,
  REPORT_PAGE_DEFS,
} from '@/features/karvita/reports/constants';
import {
  hrefWithoutDisabledReportCompare,
  searchParamsRecordToUrlSearchParams,
} from '@/features/karvita/reports/lib/report-compare-url';
import { allOrgRoutableReportSlugs } from '@/features/karvita/reports/lib/org-report-access';
import { RouteService } from '@/services/route.service';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function OrgReportSlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  if (!isReportSlug(slug) || !ORG_ROUTABLE_SLUGS.has(slug)) notFound();

  if (!REPORT_COMPARE_ENABLED) {
    const pathname = RouteService.karvita.orgReports(slug);
    const next = hrefWithoutDisabledReportCompare(
      pathname,
      searchParamsRecordToUrlSearchParams(await searchParams)
    );
    if (next) redirect(next);
  }

  return <OrgReportsModule slug={slug} />;
}
