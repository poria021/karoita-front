import {
  appendSearchParam,
} from '@/lib/dashboard-url-state';

/**
 * Live internal route catalog.
 * Planned-but-unbuilt paths live in planned-routes.ts — do not hardcode domain URLs in features.
 * Path helpers here are Edge-safe (no Nest / Zustand / browser APIs).
 */

const AUTH_BASE = '/auth';
const KARVITA_BASE = '/karvita';
const KARVITA_ADMIN_BASE = `${KARVITA_BASE}/admin`;
const KARVITA_ADMIN_DASHBOARD = `${KARVITA_ADMIN_BASE}/dashboard`;
/** Public CMS pages between landing and auth (admin-authored content). */
const MARKETING_CMS_BASE = '/p';

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
 * Public CMS surface under `/p` and `/p/...` (not the admin editor).
 */
export function isMarketingCmsPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return path === MARKETING_CMS_BASE || path.startsWith(`${MARKETING_CMS_BASE}/`);
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

export const RouteService = {
  marketing: {
    home: (): string => '/',
    /** Product picker when CMS has 2+ products */
    loginSelect: (): string => '/login-select',
    /** Precached document fallback when the network is unavailable. */
    offline: (): string => '/offline',
    /**
     * Public CMS pages hub (between landing and auth).
     * Admin editor remains `/karvita/admin/landing-cms`.
     */
    cmsPagesBase: (): string => MARKETING_CMS_BASE,
    cmsPage: (slug: string): string => {
      const clean = slug.replace(/^\/+|\/+$/g, '');
      return clean ? `${MARKETING_CMS_BASE}/${clean}` : MARKETING_CMS_BASE;
    },
    isMarketingCmsPath,
  },

  auth: {
    login: (): string => `${AUTH_BASE}/login`,
    register: (): string => `${AUTH_BASE}/register`,
    forgot: (): string => `${AUTH_BASE}/forgot`,
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

    dailyApprovals: (kind?: 'internship' | 'apprenticeship'): string => {
      const base = '/karvita/daily-approvals';
      return kind ? appendSearchParam(base, 'kind', kind) : base;
    },
    /** Syllabus index (redirect); live UI under /admin/syllabus/* */
    syllabusConfig: (): string => `${KARVITA_ADMIN_BASE}/syllabus`,
    syllabusCourseOfferings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/course-offerings`,
    syllabusTermSettings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/term-settings`,
    onboardingApprovals: (
      tab?: 'pending_admin' | 'approved' | 'rejected'
    ): string => {
      const base = `${KARVITA_ADMIN_BASE}/onboarding-approvals`;
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },
    /** No level → index redirect to L1; with level → sidebar submodule */
    internshipSelection: (level?: number): string =>
      level == null
        ? '/karvita/internships'
        : `/karvita/internships/${level}`,
    organizationalCapacities: (
      kind?: 'internship' | 'apprenticeship'
    ): string => {
      const base = '/karvita/capacities';
      return kind ? appendSearchParam(base, 'kind', kind) : base;
    },
    adminUserCreation: (): string => `${KARVITA_ADMIN_BASE}/user-creation`,
    /** Canonical org tree module */
    organizationalStructure: (
      tab?:
        | 'provinces'
        | 'cities'
        | 'districts'
        | 'schools'
        | 'majors'
        | 'faculties'
    ): string => {
      const base = `${KARVITA_ADMIN_BASE}/organizational-structure`;
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },
    landingCms: (tab?: 'banners' | 'socials' | 'products'): string => {
      const base = `${KARVITA_ADMIN_BASE}/landing-cms`;
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },

    isAdminControlPlanePath,
    isAppShellPath,
  },
} as const;
