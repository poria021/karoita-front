import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

import { InternshipEnrollmentPageClient } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentPageClient';

type InternshipEnrollmentPageProps = {
  level: InternshipEnrollmentLevel;
};

/** RSC boundary — interactive internship enrollment module leaf. */
export function InternshipEnrollmentPage({
  level,
}: InternshipEnrollmentPageProps) {
  return <InternshipEnrollmentPageClient level={level} />;
}
