import { notFound } from 'next/navigation';

import { AdminReportsModule } from '@/features/karvita/reports/components/AdminReportsModule';
import {
  isReportSlug,
  REPORT_PAGE_DEFS,
} from '@/features/karvita/reports/constants';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ slug: string }>;
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

export default async function AdminReportSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isReportSlug(slug)) notFound();
  return <AdminReportsModule slug={slug} />;
}
