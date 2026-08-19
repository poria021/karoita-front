import { OrgStructureModule } from '@/features/karvita/organizational-structure/components/OrgStructureModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('organizational-structure');

export default function OrganizationalStructureRoutePage() {
  return <OrgStructureModule />;
}
