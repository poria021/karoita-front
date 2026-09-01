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
 * صفحات ایندکس که فقط redirect می‌کنند (بدون UI خود). هدف سایدبار نیستند —
 * فوراً به زیرصفحهٔ زنده می‌روند (سرفصل → ارائه درس، کارورزی → سطح ۱).
 */
const INDEX_REDIRECT_MODULE_PATHS: readonly string[] = [
  RouteService.karvita.syllabusConfig(),
  RouteService.karvita.internshipSelection(),
];

/**
 * صفحات زنده که تا تکمیل UI در سایدبار نیستند.
 * مسیر، لاگین، ریکاوری و بردکرامب سر جایشان می‌مانند.
 * برای نمایش دوباره، همان مسیر را از این مجموعه بردارید — آیتم نقش از قبل هست.
 */
const SIDEBAR_DEFERRED_PATHS: ReadonlySet<string> = new Set([
  RouteService.karvita.dashboard(),
  RouteService.karvita.adminDashboard(),
  RouteService.karvita.adminUserCreation(),
  RouteService.karvita.landingCms(),
]);

/**
 * زیرمجموعهٔ سایدبار: مسیرهای شِل از `LIVE_STATIC_NAV_PATHS` منهای deferred.
 * از همان لیست مشتق می‌شود تا صفحهٔ جدید `/karvita/*` کاندید سایدبار باشد مگر در
 * `SIDEBAR_DEFERRED_PATHS`. مسیرهای مارکتینگ و auth بیرون می‌مانند؛ سایدبار فقط
 * داخل شِل احراز‌شده (`/(app)/karvita/*`) رندر می‌شود.
 */
const LIVE_SIDEBAR_PATH_SET: ReadonlySet<string> = new Set(
  LIVE_STATIC_NAV_PATHS.filter(
    (p) => p.startsWith('/karvita/') && !SIDEBAR_DEFERRED_PATHS.has(p)
  )
);

export function isLiveStaticNavPath(pathname: string): boolean {
  return LIVE_STATIC_NAV_PATHS.includes(normalizePath(pathname));
}

/** مسیرهایی که در سایدبار احراز‌شده دیده می‌شوند — `Set` برای جست‌وجوی O(1). */
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
 * اهداف زنده/ریدایرکت برای ریکاوری URL خراب.
 * لندینگ `/` را ندارد (CTA صفحهٔ وضعیت نیست).
 */
export function listNavigableRecoveryPaths(): readonly string[] {
  return [
    ...LIVE_STATIC_NAV_PATHS.filter(
      (path) => path !== RouteService.marketing.home()
    ),
    ...INDEX_REDIRECT_MODULE_PATHS,
  ];
}
