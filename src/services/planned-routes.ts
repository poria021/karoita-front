/**
 * مسیرهای برنامه‌ریزی‌شده (IA) بدون `page.tsx` زنده.
 * در منوی سایدبار نمایش داده نمی‌شوند (`isLiveSidebarPath`).
 * برای ناوبری واقعی از `RouteService` استفاده کنید.
 */

function normalizePlannedPath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

export const PlannedRoutes = {
  dailyReports: (): string => '/karvita/daily-reports',
  academicEvaluation: (): string => '/karvita/academic-evaluation',
  traineesManagement: (): string => '/karvita/trainees',
  studentsList: (): string => '/karvita/students',
  standardReports: (): string => '/karvita/reports',
  comparativeReports: (): string => '/karvita/reports/comparative',
  termLifecycle: (): string => '/karvita/term-lifecycle',
  locations: (): string => '/karvita/locations',
  userPermissions: (): string => '/karvita/permissions',
  manageAds: (): string => '/karvita/ads',
  internshipDetail: (internshipId: string): string =>
    `/karvita/internships/${internshipId}`,
} as const;

/** فقط مسیرهای IA بدون `page.tsx` زنده. در سایدبار نشان داده نمی‌شوند. */
export const PLANNED_STATIC_ROUTE_PATHS: readonly string[] = [
  PlannedRoutes.dailyReports(),
  PlannedRoutes.academicEvaluation(),
  PlannedRoutes.traineesManagement(),
  PlannedRoutes.studentsList(),
  PlannedRoutes.standardReports(),
  PlannedRoutes.comparativeReports(),
  PlannedRoutes.termLifecycle(),
  PlannedRoutes.locations(),
  PlannedRoutes.userPermissions(),
  PlannedRoutes.manageAds(),
] as const;

export function isPlannedStaticRoute(pathname: string): boolean {
  return PLANNED_STATIC_ROUTE_PATHS.includes(normalizePlannedPath(pathname));
}
