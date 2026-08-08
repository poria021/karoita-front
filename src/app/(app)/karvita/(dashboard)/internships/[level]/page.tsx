import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { InternshipEnrollmentPage } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';
import { getModuleMeta } from '@/utils/moduleMeta';
import { RouteService } from '@/services/route.service';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

type InternshipLevelPageProps = {
  params: Promise<{ level: string }>;
};

function parseLevel(raw: string): InternshipEnrollmentLevel | null {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

export async function generateMetadata({
  params,
}: InternshipLevelPageProps): Promise<Metadata> {
  const { level: raw } = await params;
  const level = parseLevel(raw);
  if (!level) {
    return dashboardModuleMetadata('internship-level');
  }

  const path = RouteService.karvita.internshipSelection(level);
  const meta = getModuleMeta(path);
  return {
    title: meta.title,
    description: meta.description,
    robots: { index: false, follow: false },
  };
}

export default async function InternshipEnrollmentLevelPage({
  params,
}: InternshipLevelPageProps) {
  const { level: raw } = await params;
  const level = parseLevel(raw);
  if (!level) notFound();

  return <InternshipEnrollmentPage level={level} />;
}
