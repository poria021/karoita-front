import { AdminUserCreationPage } from '@/features/karvita/user-creation/components/AdminUserCreationPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('user-creation');

export default function AdminUserCreationRoutePage() {
  return <AdminUserCreationPage />;
}
