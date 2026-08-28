'use client';

import { InternshipEnrollmentPageClient } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentPageClient';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

export function InternshipEnrollmentModule({
  level,
}: {
  level: InternshipEnrollmentLevel;
}) {
  return <InternshipEnrollmentPageClient level={level} />;
}
