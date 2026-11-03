import { AdminReportsModule } from '@/features/karvita/admin-reports/components/AdminReportsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('admin-reports');

export default function AdminReportsRoutePage() {
  return <AdminReportsModule />;
}
