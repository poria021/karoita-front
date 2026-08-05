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
 * Legacy org bookmarks only — redirect pages, not canonical modules.
 * Sole source for `/karvita/admin/organization/*` paths.
 * Live sidebar/menus must link to `organizationalStructure` / `adminUserCreation`,
 * never these bookmark URLs.
 */
export const LEGACY_ORGANIZATION_BOOKMARK_PATHS = [
  `${KARVITA_ADMIN_BASE}/organization`,
  `${KARVITA_ADMIN_BASE}/organization/structure`,
  `${KARVITA_ADMIN_BASE}/organization/accounts`,
] as const;

export const RouteService = {
  marketing: {
    home: (): string => '/',
    benefits: (): string => '/benefits',
    about: (): string => '/about',
    internship: (): string => '/internship',
    advantages: (): string => '/advantages',
  },

  auth: {
    login: (): string => `${AUTH_BASE}/login`,
    register: (): string => `${AUTH_BASE}/register`,
    adminGate: (): string => `${AUTH_BASE}/admin-gate`,
    isAuthPath,
  },

  karvita: {
    /**
     * Client-only post-auth bounce. Edge may land here (presence-only);
     * hydrated client resolves role/approval via `getPostLoginPath`.
     * Not a sidebar / navigable home destination.
     */
    entry: (): string => '/karvita/entry',
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
    /**
     * Syllabus module index (bookmark/redirect). Feature UI lives in
     * `src/features/karvita/syllabus-config`; live pages under
     * `/karvita/admin/syllabus/*` below.
     */
    syllabusConfig: (): string => `${KARVITA_ADMIN_BASE}/syllabus`,
    /** Live course-offerings page — feature: `syllabus-config`. */
    syllabusCourseOfferings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/course-offerings`,
    /** Live term-settings page — feature: `syllabus-config`. */
    syllabusTermSettings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/term-settings`,
    locations: (): string => '/karvita/locations',
    onboardingApprovals: (): string =>
      `${KARVITA_ADMIN_BASE}/onboarding-approvals`,
    userPermissions: (): string => '/karvita/permissions',
    manageAds: (): string => '/karvita/ads',
    /**
     * انتخاب واحد کارورزی/کارآموزی.
     * بدون level → ایندکس (redirect به سطح ۱)؛ با level → زیرماژول سایدبار.
     */
    internshipSelection: (level?: number): string =>
      level == null
        ? '/karvita/internships'
        : `/karvita/internships/${level}`,
    organizationalCapacities: (): string => '/karvita/capacities',
    /** Live URL `/karvita/admin/user-creation` — feature: `user-creation`. */
    adminUserCreation: (): string => `${KARVITA_ADMIN_BASE}/user-creation`,
    internshipDetail: (internshipId: string): string =>
      `/karvita/internships/${internshipId}`,

    /** Canonical org tree module — not the legacy `/organization/*` bookmarks. */
    organizationalStructure: (): string =>
      `${KARVITA_ADMIN_BASE}/organizational-structure`,

    /** Live URL `/karvita/admin/landing-cms` — feature: `landing-cms`. */
    landingCms: (): string => `${KARVITA_ADMIN_BASE}/landing-cms`,

    isAdminControlPlanePath,
    legacyOrganizationBookmarks: (): readonly string[] =>
      LEGACY_ORGANIZATION_BOOKMARK_PATHS,
  },
} as const;
