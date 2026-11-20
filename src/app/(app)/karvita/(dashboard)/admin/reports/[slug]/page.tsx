import { notFound, redirect } from 'next/navigation';

import { AdminReportsModule } from '@/features/karvita/reports/components/AdminReportsModule';
import {
  DEFAULT_REPORT_SLUG,
  isEnabledReportSlug,
  isReportSlug,
  REPORT_COMPARE_ENABLED,
  REPORT_PAGE_DEFS,
  REPORTS_MODULE_ENABLED,
} from '@/features/karvita/reports/constants';
import {
  hrefWithoutDisabledReportCompare,
  searchParamsRecordToUrlSearchParams,
} from '@/features/karvita/reports/lib/report-compare-url';
import { RouteService } from '@/services/route.service';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isReportSlug(slug)) {
    return { title: 'گزارش‌گیری', robots: { index: false, follow: false } };
  }
  const def = REPORT_PAGE_DEFS[slug];
  return {
    title: def.title,
    description: def.desc.term,
    robots: { index: false, follow: false },
  };
}

export default async function AdminReportSlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  if (!REPORTS_MODULE_ENABLED) {
    redirect(RouteService.karvita.adminDashboard());
  }
  if (!isReportSlug(slug)) notFound();
  if (!isEnabledReportSlug(slug)) {
    redirect(RouteService.karvita.reports(DEFAULT_REPORT_SLUG));
  }

  if (!REPORT_COMPARE_ENABLED) {
    const pathname = RouteService.karvita.reports(slug);
    const next = hrefWithoutDisabledReportCompare(
      pathname,
      searchParamsRecordToUrlSearchParams(await searchParams)
    );
    if (next) redirect(next);
  }

  return <AdminReportsModule slug={slug} />;
}
