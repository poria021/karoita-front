import { WorkbenchHomeModule } from '@/features/karvita/dashboard/components/WorkbenchHomeModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('admin-dashboard');

export default function KarvitaAdminDashboardPage() {
  return <WorkbenchHomeModule />;
}
