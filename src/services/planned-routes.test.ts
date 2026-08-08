import { describe, expect, it } from 'vitest';

import {
  isPlannedStaticRoute,
  PlannedRoutes,
  PLANNED_STATIC_ROUTE_PATHS,
} from '@/services/planned-routes';
import { isLiveSidebarPath, isNavigableAppPath } from '@/lib/live-nav-paths';

describe('planned-routes', () => {
  it('lists IA-only paths separately from live navigation', () => {
    expect(PLANNED_STATIC_ROUTE_PATHS).toContain(
      PlannedRoutes.dailyReports()
    );
    expect(isPlannedStaticRoute(PlannedRoutes.standardReports())).toBe(true);
    expect(isLiveSidebarPath(PlannedRoutes.dailyReports())).toBe(false);
    expect(isNavigableAppPath(PlannedRoutes.dailyReports())).toBe(false);
    expect(isNavigableAppPath(PlannedRoutes.manageAds())).toBe(false);
  });
});
