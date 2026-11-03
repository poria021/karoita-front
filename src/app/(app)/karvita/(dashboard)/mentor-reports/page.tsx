import { MentorReportsModule } from '@/features/karvita/mentor-reports/components/MentorReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('mentor-reports');

export default function MentorReportsRoutePage() {
  return <MentorReportsModule />;
}
