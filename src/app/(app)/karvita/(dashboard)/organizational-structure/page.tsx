import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

/**
 * Legacy bookmark `/karvita/organizational-structure` → admin control-plane path.
 */
export default function LegacyOrganizationalStructureRedirect() {
  redirect(RouteService.karvita.organizationalStructure());
}
