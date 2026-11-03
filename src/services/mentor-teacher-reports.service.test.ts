import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import { MentorTeacherReportsService } from '@/services/mentor-teacher-reports.service';

describe('mentoring reports for central organization', () => {
  it('route for central reports is registered', () => {
    expect(RouteService.karvita.centralReports()).toBe('/karvita/central-reports');
  });

  it('service supports the central organization role with mock data', async () => {
    const result = await MentorTeacherReportsService.listReports('central_organization');

    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.students.length).toBeGreaterThan(0);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('route and role data for senior admin reports are registered', async () => {
    expect(RouteService.karvita.adminReports()).toBe('/karvita/admin/reports');

    const result = await MentorTeacherReportsService.listReports('super_admin');

    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.students.length).toBeGreaterThan(0);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('live permissions route is registered for the admin panel', () => {
    expect(RouteService.karvita.userPermissions()).toBe('/karvita/permissions');
  });
});
