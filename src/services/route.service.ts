/**
 * کاتالوگ مسیرهای داخلی اپ.
 * برای ناوبری داخلی فقط از این سرویس استفاده شود؛ مسیر خام هاردکد نشود.
 */
export const RouteService = {
  marketing: {
    home: (): string => '/',
  },

  auth: {
    login: (): string => '/auth/login',
    register: (): string => '/auth/register',
    adminGate: (): string => '/auth/admin-gate',
  },

  shared: {
    profileIdentity: (): string => '/profile/identity',
    profileSecurity: (): string => '/profile/security',
  },

  karvita: {
    dashboard: (): string => '/karvita/dashboard',
    adminDashboard: (): string => '/karvita/admin/dashboard',
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
    syllabusConfig: (): string => '/karvita/admin/syllabus',
    syllabusConfigLegacy: (): string => '/karvita/syllabus',
    locations: (): string => '/karvita/locations',
    onboardingApprovals: (): string =>
      '/karvita/admin/onboarding-approvals',
    onboardingApprovalsLegacy: (): string => '/karvita/onboarding-approvals',
    userPermissions: (): string => '/karvita/permissions',
    manageAds: (): string => '/karvita/ads',
    internshipSelection: (): string => '/karvita/internships',
    organizationalCapacities: (): string => '/karvita/capacities',
    adminUserCreation: (): string => '/karvita/users/create',
    internshipDetail: (internshipId: string): string =>
      `/karvita/internships/${internshipId}`,

    organizationalStructure: (): string =>
      '/karvita/admin/organizational-structure',
    organizationalStructureLegacy: (): string =>
      '/karvita/organizational-structure',
  },
} as const;
