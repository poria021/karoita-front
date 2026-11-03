import { CentralReportsModule } from '@/features/karvita/central-reports/components/CentralReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('central-reports');

export default function CentralReportsRoutePage() {
  return <CentralReportsModule />;
}
