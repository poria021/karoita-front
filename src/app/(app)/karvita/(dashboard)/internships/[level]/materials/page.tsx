import type { Metadata } from 'next';

import { CourseMaterialsLearnerPage } from '@/features/karvita/course-materials/components/CourseMaterialsLearnerPage';
import { parseInternshipEnrollmentLevel } from '@/features/karvita/internship-enrollment/lib/parseInternshipEnrollmentLevel';
import { RouteService } from '@/services/route.service';
import { getModuleMeta } from '@/utils/moduleMeta';

type CourseMaterialsRoutePageProps = {
  params: Promise<{ level: string }>;
};

export async function generateMetadata({
  params,
}: CourseMaterialsRoutePageProps): Promise<Metadata> {
  const { level: raw } = await params;
  const level = parseInternshipEnrollmentLevel(raw);
  const path = level
    ? RouteService.karvita.courseMaterials(level)
    : RouteService.karvita.internshipSelection(1);
  const meta = getModuleMeta(path);
  return {
    title: meta.title,
    description: meta.description,
    robots: { index: false, follow: false },
  };
}

export default function CourseMaterialsRoutePage() {
  return <CourseMaterialsLearnerPage />;
}
