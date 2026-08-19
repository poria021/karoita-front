import { AdminUserCreationModule } from '@/features/karvita/user-creation/components/AdminUserCreationModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('user-creation');

export default function AdminUserCreationRoutePage() {
  return <AdminUserCreationModule />;
}
