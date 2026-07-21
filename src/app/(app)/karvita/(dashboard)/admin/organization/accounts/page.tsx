import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

export default function OrganizationAccountsBookmarkRedirect() {
  redirect(RouteService.karvita.adminUserCreation());
}
