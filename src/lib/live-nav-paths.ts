import { RouteService } from '@/services/route.service';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/**
 * مسیرهایی که واقعاً صفحه زنده دارند.
 * منوی سایدبار فقط لینک‌های live را نشان دهد تا 404 اعلام‌نشده نرود.
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
  RouteService.karvita.syllabusConfig(),
  RouteService.shared.profileIdentity(),
  RouteService.shared.profileSecurity(),
];

export const LEGACY_ORG_STRUCTURE_PATH =
  RouteService.karvita.organizationalStructureLegacy();

export const LEGACY_ONBOARDING_APPROVALS_PATH =
  RouteService.karvita.onboardingApprovalsLegacy();

export const LEGACY_SYLLABUS_CONFIG_PATH =
  RouteService.karvita.syllabusConfigLegacy();

export function isLiveStaticNavPath(pathname: string): boolean {
  return LIVE_STATIC_NAV_PATHS.includes(normalizePath(pathname));
}

export function isLiveSidebarPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return (
    path === RouteService.karvita.dashboard() ||
    path === RouteService.karvita.adminDashboard() ||
    path === RouteService.karvita.organizationalStructure() ||
    path === RouteService.karvita.onboardingApprovals() ||
    path === RouteService.karvita.syllabusConfig()
  );
}

export function isKarvitaProfilePath(pathname: string): boolean {
  return /^\/karvita\/[^/]+\/profile$/.test(normalizePath(pathname));
}

export function isAdminControlPlanePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  const adminHome = RouteService.karvita.adminDashboard();
  return path === adminHome || path.startsWith('/karvita/admin/');
}

export function isNavigableAppPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (isKarvitaProfilePath(path)) return true;
  if (path === LEGACY_ORG_STRUCTURE_PATH) return true;
  if (path === LEGACY_ONBOARDING_APPROVALS_PATH) return true;
  if (path === LEGACY_SYLLABUS_CONFIG_PATH) return true;
  return isLiveStaticNavPath(path);
}
