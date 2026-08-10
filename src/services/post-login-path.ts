import {
  isAdminControlPlanePath,
  isKarvitaProfilePath,
  isNavigableAppPath,
} from '@/lib/live-nav-paths';
import { parseSafeReturnUrl } from '@/lib/return-url';
import { isAppShellPath, RouteService } from '@/services/route.service';
import type { User } from '@/types/auth';
import {
  areKarvitaModulesUnlocked,
  isSuperAdminRole,
} from '@/utils/RoleStrategyMap';

export { isSuperAdminRole };

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

function parentPathname(pathname: string): string {
  const path = normalizePathname(pathname);
  if (path === '/') return '/';
  const slash = path.lastIndexOf('/');
  return slash <= 0 ? '/' : path.slice(0, slash);
}

/** Role + approval → first screen after auth (not a Nest call). */
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

export function canAccessReturnPath(
  user: User,
  path: string
): boolean {
  const pathname = (path.split('?')[0] ?? path).replace(/\/+$/, '') || '/';

  if (!isNavigableAppPath(pathname)) {
    return false;
  }

  // Locked users: fail-closed — only their own canonical profile (incl. ?tab=security).
  if (!areKarvitaModulesUnlocked(user)) {
    return pathname === RouteService.karvita.profile(user.role);
  }

  if (isKarvitaProfilePath(pathname)) {
    return true;
  }

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
 * اولویت با `returnUrl` امن و مجاز؛ در غیر این صورت `getPostLoginPath`.
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

/**
 * Walk up URL segments to the nearest live ancestor the viewer may open.
 * Skips marketing `/` — falls back to `getPostLoginPath` (login / role home).
 */
export function resolveNearestLivePath(
  pathname: string,
  user: User | null | undefined
): string {
  let path = parentPathname(pathname);

  while (path !== '/' && path !== '') {
    if (isNavigableAppPath(path)) {
      if (user) {
        if (canAccessReturnPath(user, path)) return path;
      } else if (!isAppShellPath(path)) {
        return path;
      }
    }
    path = parentPathname(path);
  }

  return getPostLoginPath(user);
}
