import { OrgStructurePage } from '@/features/karvita/organizational-structure/components/OrgStructurePage';

/**
 * Thin route for super-admin organizational structure (admin control plane).
 * Module title comes from ModulePageHeader / moduleMeta.
 */
export default function OrganizationalStructureRoutePage() {
  return <OrgStructurePage />;
}
