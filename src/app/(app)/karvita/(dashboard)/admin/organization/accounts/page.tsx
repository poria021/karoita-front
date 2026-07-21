import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

/**
 * Legacy bookmark only (`LEGACY_ORGANIZATION_BOOKMARK_PATHS`).
 * Not a canonical module — redirects to user-creation.
 * Live nav must not link here.
 */
export default function OrganizationAccountsBookmarkRedirect() {
  redirect(RouteService.karvita.adminUserCreation());
}
