import { OrgStructurePage } from '@/features/karvita/organizational-structure/components/OrgStructurePage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('organizational-structure');

export default function OrganizationalStructureRoutePage() {
  return <OrgStructurePage />;
}
