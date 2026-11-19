import { describe, expect, it } from 'vitest';

import {
  buildRoleUserCountMetrics,
  sumRoleUserCounts,
} from './role-user-counts';

describe('role-user-counts', () => {
  it('builds nine metrics in display order including central_organization', () => {
    const metrics = buildRoleUserCountMetrics({
      student: 12,
      skill_learner: 4,
      supervisor_professor: 3,
      mentor_teacher: 2,
      school_principal: 1,
      regional_edu_admin: 0,
      faculty_role: 5,
      provincial_university: 1,
      central_organization: 2,
      assistant_admin: 7,
      super_admin: 9,
    });
    expect(metrics.map((m) => m.id)).toEqual([
      'student',
      'skill_learner',
      'supervisor_professor',
      'mentor_teacher',
      'school_principal',
      'regional_edu_admin',
      'faculty_role',
      'provincial_university',
      'central_organization',
    ]);
    expect(metrics.map((m) => m.count)).toEqual([12, 4, 3, 2, 1, 0, 5, 1, 2]);
    expect(sumRoleUserCounts(metrics)).toBe(30);
  });

  it('returns an empty list without counts', () => {
    expect(buildRoleUserCountMetrics(null)).toEqual([]);
  });
});
