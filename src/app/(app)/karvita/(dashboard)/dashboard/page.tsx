import { WorkbenchHomeModule } from '@/features/karvita/dashboard/components/WorkbenchHomeModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('dashboard');

export default function KarvitaDashboardPage() {
  return <WorkbenchHomeModule />;
}
