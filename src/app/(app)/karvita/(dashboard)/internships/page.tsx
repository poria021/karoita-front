import { InternshipEnrollmentIndexClient } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentIndexClient';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('internship-level');

export default function InternshipEnrollmentIndexPage() {
  return <InternshipEnrollmentIndexClient />;
}
