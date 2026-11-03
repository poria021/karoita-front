import { RegionalReportsModule } from '@/features/karvita/regional-reports/components/RegionalReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('regional-reports');

export default function RegionalReportsRoutePage() {
  return <RegionalReportsModule />;
}
