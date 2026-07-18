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
      RouteService.karvita.organizationalStructure(),
    ]);
    expect(isLiveSidebarPath(RouteService.karvita.dailyReports())).toBe(false);
  });
});
