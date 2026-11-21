import { describe, expect, it } from 'vitest';

import { canLoadDashboardTrainees } from './dashboardTraineesQuery';

describe('canLoadDashboardTrainees', () => {
  it('allows evaluation roles that own mentor/students', () => {
    expect(canLoadDashboardTrainees('mentor_teacher')).toBe(true);
    expect(canLoadDashboardTrainees('supervisor_professor')).toBe(true);
    expect(canLoadDashboardTrainees('school_principal')).toBe(true);
  });

  it('blocks org workbench roles that get 403 on mentor/students', () => {
    expect(canLoadDashboardTrainees('regional_edu_admin')).toBe(false);
    expect(canLoadDashboardTrainees('faculty_role')).toBe(false);
    expect(canLoadDashboardTrainees('provincial_university')).toBe(false);
    expect(canLoadDashboardTrainees('central_organization')).toBe(false);
  });
});
