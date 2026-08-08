/**
 * Live internal route catalog.
 * Planned-but-unbuilt paths live in planned-routes.ts — do not hardcode domain URLs in features.
 * Path helpers here are Edge-safe (no Nest / Zustand / browser APIs).
 */

const AUTH_BASE = '/auth';
const KARVITA_BASE = '/karvita';
const KARVITA_ADMIN_BASE = `${KARVITA_BASE}/admin`;
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
 * Authenticated app/dashboard shell (`/(app)/…`).
 * Header theme toggle lives here; system/stored theme still applies on auth/marketing too.
 */
export function isAppShellPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return path === KARVITA_BASE || path.startsWith(`${KARVITA_BASE}/`);
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
    /** Product picker when CMS has 2+ products */
    loginSelect: (): string => '/login-select',
  },

  auth: {
    login: (): string => `${AUTH_BASE}/login`,
    register: (): string => `${AUTH_BASE}/register`,
    adminGate: (): string => `${AUTH_BASE}/admin-gate`,
    isAuthPath,
  },

  karvita: {
    /**
     * Post-auth bounce only — Edge lands here (presence check);
     * client then resolves role home via getPostLoginPath. Not a sidebar target.
     */
    entry: (): string => '/karvita/entry',
    dashboard: (): string => '/karvita/dashboard',
    adminDashboard: (): string => KARVITA_ADMIN_DASHBOARD,
    profile: (role: string): string => `/karvita/${role}/profile`,
    profileSecurity: (role: string): string =>
      `/karvita/${role}/profile?tab=security`,

    dailyApprovals: (): string => '/karvita/daily-approvals',
    /** Syllabus index (redirect); live UI under /admin/syllabus/* */
    syllabusConfig: (): string => `${KARVITA_ADMIN_BASE}/syllabus`,
    syllabusCourseOfferings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/course-offerings`,
    syllabusTermSettings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/term-settings`,
    onboardingApprovals: (): string =>
      `${KARVITA_ADMIN_BASE}/onboarding-approvals`,
    /** No level → index redirect to L1; with level → sidebar submodule */
    internshipSelection: (level?: number): string =>
      level == null
        ? '/karvita/internships'
        : `/karvita/internships/${level}`,
    organizationalCapacities: (): string => '/karvita/capacities',
    adminUserCreation: (): string => `${KARVITA_ADMIN_BASE}/user-creation`,
    /** Canonical org tree — not legacy /organization/* bookmarks */
    organizationalStructure: (): string =>
      `${KARVITA_ADMIN_BASE}/organizational-structure`,
    landingCms: (): string => `${KARVITA_ADMIN_BASE}/landing-cms`,

    isAdminControlPlanePath,
    isAppShellPath,
    legacyOrganizationBookmarks: (): readonly string[] =>
      LEGACY_ORGANIZATION_BOOKMARK_PATHS,
  },
} as const;
