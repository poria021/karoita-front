import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { InternshipEnrollmentPage } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentPage';
import { parseInternshipEnrollmentLevel } from '@/features/karvita/internship-enrollment/lib/parseInternshipEnrollmentLevel';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';
import { RouteService } from '@/services/route.service';
import { getModuleMeta } from '@/utils/moduleMeta';

type InternshipEnrollmentLevelRoutePageProps = {
  params: Promise<{ level: string }>;
};

export async function generateInternshipEnrollmentLevelMetadata({
  params,
}: InternshipEnrollmentLevelRoutePageProps): Promise<Metadata> {
  const { level: raw } = await params;
  const level = parseInternshipEnrollmentLevel(raw);
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

export default async function InternshipEnrollmentLevelRoutePage({
  params,
}: InternshipEnrollmentLevelRoutePageProps) {
  const { level: raw } = await params;
  const level = parseInternshipEnrollmentLevel(raw);
  if (!level) notFound();

  return <InternshipEnrollmentPage level={level} />;
}
