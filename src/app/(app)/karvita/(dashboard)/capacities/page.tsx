import { OrganizationalCapacitiesModule } from '@/features/karvita/organizational-capacities/components/OrganizationalCapacitiesModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('capacities');

export default function OrganizationalCapacitiesRoutePage() {
  return <OrganizationalCapacitiesModule />;
}
