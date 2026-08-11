import {
  isAdminControlPlanePath,
  isKarvitaProfilePath,
  isNavigableAppPath,
  listNavigableRecoveryPaths,
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

function pathSegments(pathname: string): string[] {
  return normalizePathname(pathname).split('/').filter(Boolean);
}

/** Shared leading segment count between two paths (e.g. /a/b/c vs /a/b/x → 2). */
function commonPrefixSegmentCount(a: string, b: string): number {
  const left = pathSegments(a);
  const right = pathSegments(b);
  let i = 0;
  while (i < left.length && i < right.length && left[i] === right[i]) {
    i += 1;
  }
  return i;
}

function isPathAllowedForViewer(
  path: string,
  user: User | null | undefined
): boolean {
  if (!isNavigableAppPath(path)) return false;
  if (user) return canAccessReturnPath(user, path);
  return !isAppShellPath(path);
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
 * Nearest live recovery target for a broken / unknown URL.
 * 1) Walk up exact ancestors that are navigable + allowed.
 * 2) Else pick the allowed live path with the longest shared prefix
 *    (must share more than just `/karvita` so random junk does not
 *    pretend a sibling module is “nearest”).
 * 3) Else `getPostLoginPath` (never marketing `/`).
 */
export function resolveNearestLivePath(
  pathname: string,
  user: User | null | undefined
): string {
  const current = normalizePathname(pathname);
  const home = getPostLoginPath(user);

  let path = parentPathname(current);
  while (path !== '/' && path !== '') {
    if (isPathAllowedForViewer(path, user)) return path;
    path = parentPathname(path);
  }

  const candidates = new Set<string>(listNavigableRecoveryPaths());
  if (user) {
    candidates.add(RouteService.karvita.profile(user.role));
  }

  let bestScore = 0;
  const bestAtScore: string[] = [];

  for (const candidate of candidates) {
    if (candidate === current) continue;
    if (!isPathAllowedForViewer(candidate, user)) continue;

    const score = commonPrefixSegmentCount(current, candidate);
    // Under the app shell, sharing only `karvita` is too weak to call “nearest”.
    const minScore = isAppShellPath(current) ? 2 : 1;
    if (score < minScore) continue;

    if (score > bestScore) {
      bestScore = score;
      bestAtScore.length = 0;
      bestAtScore.push(candidate);
    } else if (score === bestScore) {
      bestAtScore.push(candidate);
    }
  }

  if (bestAtScore.length === 0) return home;
  if (bestAtScore.includes(home)) return home;

  bestAtScore.sort((a, b) => {
    const len = pathSegments(a).length - pathSegments(b).length;
    if (len !== 0) return len;
    return a.localeCompare(b);
  });

  return bestAtScore[0] ?? home;
}
