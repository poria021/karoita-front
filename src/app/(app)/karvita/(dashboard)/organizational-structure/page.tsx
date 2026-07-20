import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

export default function LegacyOrganizationalStructureRedirect() {
  redirect(RouteService.karvita.organizationalStructure());
}
