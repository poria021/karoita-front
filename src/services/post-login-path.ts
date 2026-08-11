import {
  isAdminControlPlanePath,
  isKarvitaProfilePath,
  isNavigableAppPath,
  listNavigableRecoveryPaths,
} from '@/lib/live-nav-paths';
import { parseSafeReturnUrl } from '@/lib/return-url';
import {
  isAppShellPath,
  isAuthPath,
  isMarketingCmsPath,
  RouteService,
} from '@/services/route.service';
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

/** Classic Levenshtein — small strings only (path segments / short paths). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) {
      prev[j] = curr[j] ?? 0;
    }
  }

  return prev[b.length] ?? b.length;
}

function isPathAllowedForViewer(
  path: string,
  user: User | null | undefined
): boolean {
  if (!isNavigableAppPath(path)) return false;
  if (user) return canAccessReturnPath(user, path);
  return !isAppShellPath(path);
}

/**
 * Zone hub when prefix walk / LCP cannot resolve a live sibling.
 * Uses RouteService surfaces so `/auth/...` typos recover to login, not landing.
 */
function resolveZoneFallbackPath(
  pathname: string,
  user: User | null | undefined
): string {
  const first = pathSegments(pathname)[0] ?? '';

  if (isAuthPath(pathname) || levenshtein(first, 'auth') <= 1) {
    return RouteService.auth.login();
  }

  if (isAppShellPath(pathname) || levenshtein(first, 'karvita') <= 2) {
    return user ? getPostLoginPath(user) : RouteService.auth.login();
  }

  if (
    isMarketingCmsPath(pathname) ||
    first === 'p' ||
    first === 'login-select' ||
    pathname.startsWith(`${RouteService.marketing.loginSelect()}/`)
  ) {
    return first === 'login-select' ||
      pathname.startsWith(`${RouteService.marketing.loginSelect()}/`)
      ? RouteService.marketing.loginSelect()
      : RouteService.marketing.home();
  }

  return user ? getPostLoginPath(user) : RouteService.marketing.home();
}

function leafSegment(pathname: string): string {
  const segs = pathSegments(pathname);
  return segs[segs.length - 1] ?? '';
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
 * Nearest live recovery target from the RouteService / live-path catalog.
 * 1) Walk up exact navigable ancestors.
 * 2) Else longest shared prefix among allowed live paths; tie-break by
 *    leaf-segment edit distance (typos like `/auth/loginn` → login).
 * 3) Else zone hub (`/auth` → login, `/karvita` → role home, else landing).
 */
export function resolveNearestLivePath(
  pathname: string,
  user: User | null | undefined
): string {
  const current = normalizePathname(pathname);
  const zoneHome = resolveZoneFallbackPath(current, user);

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

  if (bestAtScore.length === 0) {
    return zoneHome;
  }

  const currentLeaf = leafSegment(current);
  bestAtScore.sort((a, b) => {
    const distA = levenshtein(currentLeaf, leafSegment(a));
    const distB = levenshtein(currentLeaf, leafSegment(b));
    if (distA !== distB) return distA - distB;

    const len = pathSegments(a).length - pathSegments(b).length;
    if (len !== 0) return len;

    // Prefer zone hub when distances are tied (e.g. auth → login).
    if (a === zoneHome) return -1;
    if (b === zoneHome) return 1;

    return a.localeCompare(b);
  });

  const best = bestAtScore[0] ?? zoneHome;
  const bestDist = levenshtein(currentLeaf, leafSegment(best));
  // Unrelated sibling under same prefix (e.g. /auth/xyz) → zone hub.
  if (bestDist > 2) {
    return zoneHome;
  }

  return best;
}
