import { UserPermissionsModule } from '@/features/karvita/user-permissions/components/UserPermissionsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('user-permissions');

export default function UserPermissionsRoutePage() {
  return <UserPermissionsModule />;
}
