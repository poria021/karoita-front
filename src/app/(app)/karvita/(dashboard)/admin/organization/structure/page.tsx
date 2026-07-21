import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

export default function OrganizationStructureBookmarkRedirect() {
  redirect(RouteService.karvita.organizationalStructure());
}
