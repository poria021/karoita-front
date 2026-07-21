import { describe, expect, it } from 'vitest';

import {
  isAdminControlPlanePath,
  isLiveSidebarPath,
} from '@/lib/live-nav-paths';
import { RouteService } from '@/services/route.service';
import { getVisibleSidebarMenu } from '@/utils/RoleStrategyMap';

describe('live nav / admin plane', () => {
  it('treats org structure as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.organizationalStructure())
    ).toBe(true);
    expect(
      isAdminControlPlanePath(RouteService.karvita.organizationalStructureLegacy())
    ).toBe(false);
  });

  it('only exposes live sidebar links for student and super_admin', () => {
    expect(getVisibleSidebarMenu('student').map((i) => i.path)).toEqual([
      RouteService.karvita.dashboard(),
    ]);
    expect(getVisibleSidebarMenu('super_admin').map((i) => i.path)).toEqual([
      RouteService.karvita.adminDashboard(),
      RouteService.karvita.onboardingApprovals(),
      RouteService.karvita.adminUserCreation(),
      RouteService.karvita.syllabusConfig(),
      RouteService.karvita.organizationalStructure(),
    ]);
    expect(isLiveSidebarPath(RouteService.karvita.dailyReports())).toBe(false);
  });

  it('treats onboarding approvals as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.onboardingApprovals())
    ).toBe(true);
    expect(
      isAdminControlPlanePath(RouteService.karvita.onboardingApprovalsLegacy())
    ).toBe(false);
  });

  it('treats syllabus config as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.syllabusConfig())
    ).toBe(true);
    expect(
      isAdminControlPlanePath(RouteService.karvita.syllabusConfigLegacy())
    ).toBe(false);
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
