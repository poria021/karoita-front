import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';

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
    expect(paths).not.toContain(RouteService.karvita.standardReports());
  });

  it('returns no dead module shortcuts for a typical locked student menu', () => {
    const shortcuts = getLiveWorkbenchShortcuts('student');
    expect(shortcuts).toEqual([]);
  });
});
