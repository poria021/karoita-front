import {
  isAdminControlPlanePath,
  RouteService,
} from '@/services/route.service';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

const INTERNSHIP_LEVEL_PATHS: readonly string[] = [
  RouteService.karvita.internshipSelection(1),
  RouteService.karvita.internshipSelection(2),
  RouteService.karvita.internshipSelection(3),
  RouteService.karvita.internshipSelection(4),
];

/**
 * مسیرهایی که واقعاً صفحه زنده دارند.
 * منوی سایدبار فقط لینک‌های live را نشان دهد تا 404 اعلام‌نشده نرود.
 * مسیرهای IA بدون صفحه → `PlannedRoutes` در `planned-routes.ts`.
 */
export const LIVE_STATIC_NAV_PATHS: readonly string[] = [
  RouteService.marketing.home(),
  RouteService.marketing.loginSelect(),
  RouteService.auth.login(),
  RouteService.auth.register(),
  RouteService.auth.forgot(),
  RouteService.auth.adminGate(),
  RouteService.karvita.dashboard(),
  RouteService.karvita.adminDashboard(),
  RouteService.karvita.organizationalStructure(),
  RouteService.karvita.adminUserCreation(),
  RouteService.karvita.onboardingApprovals(),
  RouteService.karvita.landingCms(),
  RouteService.karvita.syllabusCourseOfferings(),
  RouteService.karvita.syllabusTermSettings(),
  RouteService.karvita.dailyApprovals(),
  RouteService.karvita.organizationalCapacities(),
  ...INTERNSHIP_LEVEL_PATHS,
];

/**
 * Navigable index-redirect pages (redirect-only, no own UI). Not sidebar
 * live targets themselves — they immediately redirect into a live subpage
 * (syllabus index → course-offerings, internship index → level 1).
 */
const INDEX_REDIRECT_MODULE_PATHS: readonly string[] = [
  RouteService.karvita.syllabusConfig(),
  RouteService.karvita.internshipSelection(),
];

/**
 * Sidebar subset: app-shell paths from LIVE_STATIC_NAV_PATHS only.
 *
 * Derived from LIVE_STATIC_NAV_PATHS (single source of truth) so it can
 * never drift out of sync — adding a new /karvita/* page automatically
 * makes it a sidebar candidate without touching this file.
 *
 * Marketing and auth paths are excluded: sidebar is only rendered inside
 * the authenticated app shell (/(app)/karvita/*).
 */
const LIVE_SIDEBAR_PATH_SET: ReadonlySet<string> = new Set(
  LIVE_STATIC_NAV_PATHS.filter((p) => p.startsWith('/karvita/'))
);

export function isLiveStaticNavPath(pathname: string): boolean {
  return LIVE_STATIC_NAV_PATHS.includes(normalizePath(pathname));
}

/**
 * True for paths that appear in the authenticated sidebar (app-shell only).
 * Uses a Set for O(1) lookup instead of duplicating the manual path list.
 */
export function isLiveSidebarPath(pathname: string): boolean {
  return LIVE_SIDEBAR_PATH_SET.has(normalizePath(pathname));
}

export function isKarvitaProfilePath(pathname: string): boolean {
  return /^\/karvita\/[^/]+\/profile$/.test(normalizePath(pathname));
}

export { isAdminControlPlanePath };

export function isNavigableAppPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (isKarvitaProfilePath(path)) return true;
  if (INDEX_REDIRECT_MODULE_PATHS.includes(path)) return true;
  return isLiveStaticNavPath(path);
}

/**
 * Live / redirect targets used when recovering from a broken URL.
 * Excludes marketing `/` (not a status-page recovery CTA).
 */
export function listNavigableRecoveryPaths(): readonly string[] {
  return [
    ...LIVE_STATIC_NAV_PATHS.filter(
      (path) => path !== RouteService.marketing.home()
    ),
    ...INDEX_REDIRECT_MODULE_PATHS,
  ];
}
