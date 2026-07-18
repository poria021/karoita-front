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
 */

export const RouteService = {
  /** Public, unauthenticated pages living under `src/app/(marketing)/`. */
  marketing: {
    home: (): string => '/',
    about: (): string => '/about',
    contact: (): string => '/contact',
    pricing: (): string => '/pricing',
  },

  /** Authentication flows shared across every domain. */
  auth: {
    login: (): string => '/auth/login',
    register: (): string => '/auth/register',
    forgotPassword: (): string => '/auth/forgot-password',
    /** Independent, gated entry point for senior/organization administrators. */
    adminGate: (): string => '/auth/admin-gate',
  },

  /** Cross-domain features that live in `src/features/shared/`. */
  shared: {
    /** @deprecated Prefer `RouteService.karvita.profile(role)` for role-scoped profile. */
    profileIdentity: (): string => '/profile/identity',
    profileSecurity: (): string => '/profile/security',
    notifications: (): string => '/notifications',
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
    organizationalStructure: (): string => '/karvita/organizational-structure',
    adminUserCreation: (): string => '/karvita/users/create',
    internshipDetail: (internshipId: string): string =>
      `/karvita/internships/${internshipId}`,
  },
} as const;
