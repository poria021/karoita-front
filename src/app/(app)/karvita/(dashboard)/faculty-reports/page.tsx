import { FacultyReportsModule } from '@/features/karvita/faculty-reports/components/FacultyReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('faculty-reports');

export default function FacultyReportsRoutePage() {
  return <FacultyReportsModule />;
}
