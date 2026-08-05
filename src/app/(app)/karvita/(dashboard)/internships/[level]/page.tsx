import { notFound } from 'next/navigation';

import { InternshipEnrollmentPage } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentPage';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

type InternshipLevelPageProps = {
  params: Promise<{ level: string }>;
};

function parseLevel(raw: string): InternshipEnrollmentLevel | null {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

export default async function InternshipEnrollmentLevelPage({
  params,
}: InternshipLevelPageProps) {
  const { level: raw } = await params;
  const level = parseLevel(raw);
  if (!level) notFound();

  return <InternshipEnrollmentPage level={level} />;
}
