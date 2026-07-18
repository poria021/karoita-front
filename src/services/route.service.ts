/**
 * RouteService — single source of truth for internal navigation paths.
 *
 * Per rule 60 (Multi-Module Isolation), navigation between/within domains
 * MUST go through this service instead of hardcoded path strings:
 *
 *   router.push(RouteService.karvita.dashboard());   // ✅ Correct
 *   router.push('/karvita/dashboard');                // ❌ Forbidden
 *
 * When a new domain is added (checklist item 13, rule 60), add its route
 * group here as a new top-level key so every consumer stays in sync.
 *
 * Catalog hygiene: prefer only paths that are `live` (page exists) or
 * intentional redirects. Future module paths stay here for IA when a page
 * ships — until then hide them from sidebars via `isLiveSidebarPath`.
 */

export const RouteService = {
  /** Public, unauthenticated pages living under `src/app/(marketing)/`. */
  marketing: {
    home: (): string => '/',
  },

  /** Authentication flows shared across every domain. */
  auth: {
    login: (): string => '/auth/login',
    register: (): string => '/auth/register',
    /** Independent, gated entry point for senior/organization administrators. */
    adminGate: (): string => '/auth/admin-gate',
  },

  /** Cross-domain features that live in `src/features/shared/`. */
  shared: {
    /** @deprecated Prefer `RouteService.karvita.profile(role)` — redirect page only. */
    profileIdentity: (): string => '/profile/identity',
    /**
     * @deprecated Prefer `RouteService.karvita.profile(role)?tab=security`.
     * Redirect page only — do not link from new UI.
     */
    profileSecurity: (): string => '/profile/security',
  },

  /** Karvita domain — `src/app/(app)/karvita/` route group. */
  karvita: {
    dashboard: (): string => '/karvita/dashboard',
    /**
     * Super-admin control plane — must stay distinct from the shared
     * user dashboard (`dashboard()`).
     */
    adminDashboard: (): string => '/karvita/admin/dashboard',
    /** Role-scoped profile & identity security workspace. */
    profile: (role: string): string => `/karvita/${role}/profile`,
    /** Canonical profile security deep link. */
    profileSecurity: (role: string): string =>
      `/karvita/${role}/profile?tab=security`,

    // --- Future modules (IA reserved; hide from nav until page + LIVE list) ---
    dailyReports: (): string => '/karvita/daily-reports',
    dailyApprovals: (): string => '/karvita/daily-approvals',
    academicEvaluation: (): string => '/karvita/academic-evaluation',
    traineesManagement: (): string => '/karvita/trainees',
    studentsList: (): string => '/karvita/students',
    standardReports: (): string => '/karvita/reports',
    comparativeReports: (): string => '/karvita/reports/comparative',
    termLifecycle: (): string => '/karvita/term-lifecycle',
    syllabusConfig: (): string => '/karvita/syllabus',
    locations: (): string => '/karvita/locations',
    onboardingApprovals: (): string => '/karvita/onboarding-approvals',
    userPermissions: (): string => '/karvita/permissions',
    manageAds: (): string => '/karvita/ads',
    internshipSelection: (): string => '/karvita/internships',
    organizationalCapacities: (): string => '/karvita/capacities',
    adminUserCreation: (): string => '/karvita/users/create',
    internshipDetail: (internshipId: string): string =>
      `/karvita/internships/${internshipId}`,

    /**
     * Super-admin org structure — under `/karvita/admin/` so control-plane
     * guards apply by prefix.
     */
    organizationalStructure: (): string =>
      '/karvita/admin/organizational-structure',
    /** @deprecated Bookmark redirect → `organizationalStructure()`. */
    organizationalStructureLegacy: (): string =>
      '/karvita/organizational-structure',
  },
} as const;
