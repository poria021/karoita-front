import { OrganizationalCapacitiesPage } from '@/features/karvita/organizational-capacities/components/OrganizationalCapacitiesPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('capacities');

export default function OrganizationalCapacitiesRoutePage() {
  return <OrganizationalCapacitiesPage />;
}
