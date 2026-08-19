'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

const InternshipEnrollmentPageClient = loadDashboardClient<{
  level: InternshipEnrollmentLevel;
}>(() =>
  import('@/features/karvita/internship-enrollment/components/InternshipEnrollmentPageClient').then(
    (mod) => ({ default: mod.InternshipEnrollmentPageClient })
  )
);

export function InternshipEnrollmentModule({
  level,
}: {
  level: InternshipEnrollmentLevel;
}) {
  return <InternshipEnrollmentPageClient level={level} />;
}
