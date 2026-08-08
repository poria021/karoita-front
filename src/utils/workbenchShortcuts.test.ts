import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import { PlannedRoutes } from '@/services/planned-routes';

import { getLiveWorkbenchShortcuts } from './workbenchShortcuts';

describe('getLiveWorkbenchShortcuts', () => {
  it('returns live admin modules and excludes the admin home itself', () => {
    const shortcuts = getLiveWorkbenchShortcuts('super_admin');
    const paths = shortcuts.map((item) => item.path);

    expect(paths).not.toContain(RouteService.karvita.adminDashboard());
    expect(paths).toContain(RouteService.karvita.organizationalStructure());
    expect(paths).toContain(RouteService.karvita.onboardingApprovals());
    expect(paths).toContain(RouteService.karvita.adminUserCreation());
    expect(paths).toContain(RouteService.karvita.syllabusCourseOfferings());
    expect(paths).not.toContain(PlannedRoutes.standardReports());
  });

  it('returns live internship shortcuts for student and excludes planned modules', () => {
    const shortcuts = getLiveWorkbenchShortcuts('student');
    const paths = shortcuts.map((item) => item.path);
    expect(paths).toEqual([
      RouteService.karvita.internshipSelection(1),
      RouteService.karvita.internshipSelection(2),
      RouteService.karvita.internshipSelection(3),
      RouteService.karvita.internshipSelection(4),
    ]);
    expect(paths).not.toContain(PlannedRoutes.dailyReports());
  });
});
