import {
  isAdminControlPlanePath,
  isKarvitaProfilePath,
  isNavigableAppPath,
} from '@/lib/live-nav-paths';
import { parseSafeReturnUrl } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';
import type { User } from '@/types/auth';
import {
  areKarvitaModulesUnlocked,
  isSuperAdminRole,
} from '@/utils/RoleStrategyMap';

export { isSuperAdminRole };

/**
 * Post-auth landing path (rule 60 + 45). Super-admin never lands on the shared
 * user dashboard. Client UX only — not API authorization.
 */
export function getPostLoginPath(user: User | null | undefined): string {
  if (!user) {
    return RouteService.auth.login();
  }

  if (isSuperAdminRole(user.role)) {
    return RouteService.karvita.adminDashboard();
  }

  if (!areKarvitaModulesUnlocked(user)) {
    return RouteService.karvita.profile(user.role);
  }

  return RouteService.karvita.dashboard();
}

/**
 * Whether `path` is an allowed returnUrl target for this user (UX only).
 */
export function canAccessReturnPath(
  user: User,
  path: string
): boolean {
  const pathname = (path.split('?')[0] ?? path).replace(/\/+$/, '') || '/';

  if (!isNavigableAppPath(pathname)) {
    return false;
  }

  if (isKarvitaProfilePath(pathname)) {
    return true;
  }

  if (!areKarvitaModulesUnlocked(user)) {
    return (
      pathname === RouteService.shared.profileIdentity() ||
      pathname === RouteService.shared.profileSecurity()
    );
  }

  // Unlocked users continue below; profile already allowed above.

  if (isAdminControlPlanePath(pathname) && !isSuperAdminRole(user.role)) {
    return false;
  }

  if (
    isSuperAdminRole(user.role) &&
    pathname === RouteService.karvita.dashboard()
  ) {
    return false;
  }

  return true;
}

/**
 * Prefer a validated returnUrl when the user may access it; otherwise role home.
 */
export function resolvePostAuthPath(
  user: User | null | undefined,
  rawReturnUrl?: string | null
): string {
  const home = getPostLoginPath(user);
  if (!user) return home;

  const safe = parseSafeReturnUrl(rawReturnUrl);
  if (!safe) return home;
  if (!canAccessReturnPath(user, safe)) return home;
  return safe;
}
