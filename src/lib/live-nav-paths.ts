import { RouteService } from '@/services/route.service';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/**
 * Static paths that currently have an App Router page or intentional redirect.
 * Sidebar may only link to these (plus role profile via footer, not this list).
 * When shipping a new module page, add its RouteService path here.
 */
export const LIVE_STATIC_NAV_PATHS: readonly string[] = [
  RouteService.marketing.home(),
  RouteService.auth.login(),
  RouteService.auth.register(),
  RouteService.auth.adminGate(),
  RouteService.karvita.dashboard(),
  RouteService.karvita.adminDashboard(),
  RouteService.karvita.organizationalStructure(),
  RouteService.karvita.onboardingApprovals(),
  RouteService.shared.profileIdentity(),
  RouteService.shared.profileSecurity(),
];

/** Bookmark path that redirects to the admin org-structure page. */
export const LEGACY_ORG_STRUCTURE_PATH =
  RouteService.karvita.organizationalStructureLegacy();

/** Bookmark path that redirects to the admin onboarding-approvals page. */
export const LEGACY_ONBOARDING_APPROVALS_PATH =
  RouteService.karvita.onboardingApprovalsLegacy();

export function isLiveStaticNavPath(pathname: string): boolean {
  return LIVE_STATIC_NAV_PATHS.includes(normalizePath(pathname));
}

/** Sidebar entries: only live module routes (not auth/marketing/profile redirects). */
export function isLiveSidebarPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return (
    path === RouteService.karvita.dashboard() ||
    path === RouteService.karvita.adminDashboard() ||
    path === RouteService.karvita.organizationalStructure() ||
    path === RouteService.karvita.onboardingApprovals()
  );
}

export function isKarvitaProfilePath(pathname: string): boolean {
  return /^\/karvita\/[^/]+\/profile$/.test(normalizePath(pathname));
}

/** Admin control plane — matches KarvitaModuleAccessGuard prefix. */
export function isAdminControlPlanePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  const adminHome = RouteService.karvita.adminDashboard();
  return path === adminHome || path.startsWith('/karvita/admin/');
}

/**
 * Paths a logged-in user may be returned to after auth (UX gate only).
 * Unknown / future module URLs are rejected so returnUrl cannot land on bare 404s
 * that were never announced as live.
 */
export function isNavigableAppPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (isKarvitaProfilePath(path)) return true;
  if (path === LEGACY_ORG_STRUCTURE_PATH) return true;
  if (path === LEGACY_ONBOARDING_APPROVALS_PATH) return true;
  return isLiveStaticNavPath(path);
}
