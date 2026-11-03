import { PrincipalReportsModule } from '@/features/karvita/principal-reports/components/PrincipalReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('principal-reports');

export default function PrincipalReportsRoutePage() {
  return <PrincipalReportsModule />;
}
