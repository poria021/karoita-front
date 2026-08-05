import {
  isAdminControlPlanePath,
  LEGACY_ORGANIZATION_BOOKMARK_PATHS,
  RouteService,
} from '@/services/route.service';

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
  RouteService.karvita.adminUserCreation(),
  RouteService.karvita.onboardingApprovals(),
  RouteService.karvita.syllabusCourseOfferings(),
  RouteService.karvita.syllabusTermSettings(),
  RouteService.karvita.internshipSelection(),
];

/**
 * Navigable legacy bookmarks (redirect-only). Not sidebar live targets.
 * Org paths come from LEGACY_ORGANIZATION_BOOKMARK_PATHS; syllabus index
 * redirects into live syllabus subpages.
 */
const LEGACY_TABBED_MODULE_PATHS: readonly string[] = [
  ...LEGACY_ORGANIZATION_BOOKMARK_PATHS,
  RouteService.karvita.syllabusConfig(),
];

export function isLiveStaticNavPath(pathname: string): boolean {
  return LIVE_STATIC_NAV_PATHS.includes(normalizePath(pathname));
}

export function isLiveSidebarPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return (
    path === RouteService.karvita.dashboard() ||
    path === RouteService.karvita.adminDashboard() ||
    path === RouteService.karvita.organizationalStructure() ||
    path === RouteService.karvita.adminUserCreation() ||
    path === RouteService.karvita.onboardingApprovals() ||
    path === RouteService.karvita.syllabusCourseOfferings() ||
    path === RouteService.karvita.syllabusTermSettings() ||
    path === RouteService.karvita.internshipSelection()
  );
}

export function isKarvitaProfilePath(pathname: string): boolean {
  return /^\/karvita\/[^/]+\/profile$/.test(normalizePath(pathname));
}

export { isAdminControlPlanePath };

export function isNavigableAppPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (isKarvitaProfilePath(path)) return true;
  if (LEGACY_TABBED_MODULE_PATHS.includes(path)) return true;
  return isLiveStaticNavPath(path);
}
