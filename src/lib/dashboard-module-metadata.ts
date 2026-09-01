import type { Metadata } from 'next';

import { RouteService } from '@/services/route.service';
import { getModuleMeta } from '@/utils/moduleMeta';

/** کلید ماژول داشبورد هم‌تراز با مسیرهای زندهٔ `page.tsx`. */
export type DashboardModuleKey =
  | 'dashboard'
  | 'admin-dashboard'
  | 'organizational-structure'
  | 'user-creation'
  | 'onboarding-approvals'
  | 'landing-cms'
  | 'syllabus-course-offerings'
  | 'syllabus-term-settings'
  | 'daily-approvals'
  | 'capacities'
  | 'internship-level'
  | 'profile';

const MODULE_PATH: Record<DashboardModuleKey, string | ((role?: string) => string)> =
  {
    dashboard: RouteService.karvita.dashboard(),
    'admin-dashboard': RouteService.karvita.adminDashboard(),
    'organizational-structure':
      RouteService.karvita.organizationalStructure(),
    'user-creation': RouteService.karvita.adminUserCreation(),
    'onboarding-approvals': RouteService.karvita.onboardingApprovals(),
    'landing-cms': RouteService.karvita.landingCms(),
    'syllabus-course-offerings':
      RouteService.karvita.syllabusCourseOfferings(),
    'syllabus-term-settings': RouteService.karvita.syllabusTermSettings(),
    'daily-approvals': RouteService.karvita.dailyApprovals(),
    capacities: RouteService.karvita.organizationalCapacities(),
    'internship-level': RouteService.karvita.internshipSelection(1),
    profile: (role = 'student') => RouteService.karvita.profile(role),
  };

export function resolveDashboardModulePath(
  key: DashboardModuleKey,
  role?: string
): string {
  const entry = MODULE_PATH[key];
  return typeof entry === 'function' ? entry(role) : entry;
}

/** metadata RSC برای مسیرهای داشبورد — عنوان از `moduleMeta`. */
export function dashboardModuleMetadata(
  key: DashboardModuleKey,
  role?: string
): Metadata {
  const path = resolveDashboardModulePath(key, role);
  const meta = getModuleMeta(path, role as import('@/types/auth').UserRole);

  return {
    title: meta.title,
    description: meta.description,
    robots: { index: false, follow: false },
  };
}
