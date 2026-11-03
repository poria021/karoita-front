import { ProvincialReportsModule } from '@/features/karvita/provincial-reports/components/ProvincialReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('provincial-reports');

export default function ProvincialReportsRoutePage() {
  return <ProvincialReportsModule />;
}
