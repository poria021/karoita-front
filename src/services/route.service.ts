/**
 * کاتالوگ مسیرهای داخلی اپ.
 * برای ناوبری داخلی فقط از این سرویس استفاده شود؛ مسیر خام هاردکد نشود.
 *
 * Path helpers below are Edge-safe (no Nest/Zustand/browser APIs).
 */

const AUTH_BASE = '/auth';
const KARVITA_ADMIN_BASE = '/karvita/admin';
const KARVITA_ADMIN_DASHBOARD = `${KARVITA_ADMIN_BASE}/dashboard`;

function normalizeAppPath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** Auth route tree: `/auth` and `/auth/...` */
export function isAuthPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return path === AUTH_BASE || path.startsWith(`${AUTH_BASE}/`);
}

/**
 * Super-admin control plane under `/karvita/admin/...`
 * (dashboard + modules).
 */
export function isAdminControlPlanePath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return (
    path === KARVITA_ADMIN_DASHBOARD ||
    path.startsWith(`${KARVITA_ADMIN_BASE}/`)
  );
}

/**
 * Temporary bookmarks from the brief tabbed org IA (navigable / redirect only).
 */
export const LEGACY_ORGANIZATION_BOOKMARK_PATHS = [
  `${KARVITA_ADMIN_BASE}/organization`,
  `${KARVITA_ADMIN_BASE}/organization/structure`,
  `${KARVITA_ADMIN_BASE}/organization/accounts`,
] as const;

export const RouteService = {
  marketing: {
    home: (): string => '/',
  },

  auth: {
    login: (): string => `${AUTH_BASE}/login`,
    register: (): string => `${AUTH_BASE}/register`,
    adminGate: (): string => `${AUTH_BASE}/admin-gate`,
    isAuthPath,
  },

  karvita: {
    dashboard: (): string => '/karvita/dashboard',
    adminDashboard: (): string => KARVITA_ADMIN_DASHBOARD,
    profile: (role: string): string => `/karvita/${role}/profile`,
    profileSecurity: (role: string): string =>
      `/karvita/${role}/profile?tab=security`,

    dailyReports: (): string => '/karvita/daily-reports',
    dailyApprovals: (): string => '/karvita/daily-approvals',
    academicEvaluation: (): string => '/karvita/academic-evaluation',
    traineesManagement: (): string => '/karvita/trainees',
    studentsList: (): string => '/karvita/students',
    standardReports: (): string => '/karvita/reports',
    comparativeReports: (): string => '/karvita/reports/comparative',
    termLifecycle: (): string => '/karvita/term-lifecycle',
    syllabusConfig: (): string => `${KARVITA_ADMIN_BASE}/syllabus`,
    syllabusCourseOfferings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/course-offerings`,
    syllabusTermSettings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/term-settings`,
    locations: (): string => '/karvita/locations',
    onboardingApprovals: (): string =>
      `${KARVITA_ADMIN_BASE}/onboarding-approvals`,
    userPermissions: (): string => '/karvita/permissions',
    manageAds: (): string => '/karvita/ads',
    internshipSelection: (): string => '/karvita/internships',
    organizationalCapacities: (): string => '/karvita/capacities',
    adminUserCreation: (): string => `${KARVITA_ADMIN_BASE}/user-creation`,
    internshipDetail: (internshipId: string): string =>
      `/karvita/internships/${internshipId}`,

    organizationalStructure: (): string =>
      `${KARVITA_ADMIN_BASE}/organizational-structure`,

    isAdminControlPlanePath,
    legacyOrganizationBookmarks: (): readonly string[] =>
      LEGACY_ORGANIZATION_BOOKMARK_PATHS,
  },
} as const;
