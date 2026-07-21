import { describe, expect, it } from 'vitest';

import {
  isAdminControlPlanePath,
  isLiveSidebarPath,
  isNavigableAppPath,
} from '@/lib/live-nav-paths';
import { RouteService } from '@/services/route.service';
import {
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
} from '@/utils/RoleStrategyMap';

describe('live nav / admin plane', () => {
  it('treats org structure as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.organizationalStructure())
    ).toBe(true);
    expect(isNavigableAppPath('/karvita/organizational-structure')).toBe(
      false
    );
  });

  it('only exposes live sidebar links for student and super_admin', () => {
    expect(getVisibleSidebarMenu('student').map((i) => ('path' in i ? i.path : i.title))).toEqual([
      RouteService.karvita.dashboard(),
    ]);

    const adminMenu = getVisibleSidebarMenu('super_admin');
    expect(adminMenu.map((entry) => entry.title)).toEqual([
      'میز کار مدیریت',
      'بررسی مدارک هویتی',
      'مدیریت سازمانی',
      'مدیریت ترم و سرفصل',
    ]);

    const orgGroup = adminMenu.find(isSidebarMenuGroup);
    expect(orgGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.organizationalStructure(),
      RouteService.karvita.adminUserCreation(),
    ]);

    expect(isLiveSidebarPath(RouteService.karvita.dailyReports())).toBe(false);
  });

  it('treats onboarding approvals as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.onboardingApprovals())
    ).toBe(true);
    expect(isNavigableAppPath('/karvita/onboarding-approvals')).toBe(false);
  });

  it('treats syllabus config as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.syllabusConfig())
    ).toBe(true);
    expect(isNavigableAppPath('/karvita/syllabus')).toBe(false);
    expect(isLiveSidebarPath(RouteService.karvita.syllabusConfig())).toBe(true);
  });

  it('treats admin user creation as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.adminUserCreation())
    ).toBe(true);
    expect(
      isLiveSidebarPath(RouteService.karvita.adminUserCreation())
    ).toBe(true);
  });
});
