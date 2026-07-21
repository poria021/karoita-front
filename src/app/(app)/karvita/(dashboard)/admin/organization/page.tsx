import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

/** Brief tab-IA bookmark — modules are separate pages again. */
export default function OrganizationAdminIndexRedirect() {
  redirect(RouteService.karvita.organizationalStructure());
}
