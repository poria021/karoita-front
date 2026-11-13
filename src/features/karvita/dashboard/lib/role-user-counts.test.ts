import { describe, expect, it } from 'vitest';

import type { UserRole } from '@/types/auth';

import {
  buildRoleUserCountMetrics,
  FAKE_ROLE_USER_COUNTS,
  sumRoleUserCounts,
  tallyRolesFromList,
} from './role-user-counts';

describe('role-user-counts', () => {
  it('tallies roles from a flat list', () => {
    const roles: UserRole[] = [
      'student',
      'student',
      'mentor_teacher',
      'student',
      'supervisor_professor',
    ];
    expect(tallyRolesFromList(roles)).toEqual({
      student: 3,
      mentor_teacher: 1,
      supervisor_professor: 1,
    });
  });

  it('builds nine metrics in display order including assistant_admin', () => {
    const metrics = buildRoleUserCountMetrics({
      student: 12,
      skill_learner: 4,
      supervisor_professor: 3,
      mentor_teacher: 2,
      school_principal: 1,
      regional_edu_admin: 0,
      faculty_role: 5,
      provincial_university: 1,
      assistant_admin: 2,
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
      'assistant_admin',
    ]);
    expect(metrics.map((m) => m.count)).toEqual([12, 4, 3, 2, 1, 0, 5, 1, 2]);
    expect(sumRoleUserCounts(metrics)).toBe(30);
  });

  it('returns an empty list without counts', () => {
    expect(buildRoleUserCountMetrics(null)).toEqual([]);
  });

  it('exposes fake counts for every display role', () => {
    const metrics = buildRoleUserCountMetrics(FAKE_ROLE_USER_COUNTS);
    expect(metrics).toHaveLength(9);
    expect(metrics.every((m) => m.count > 0)).toBe(true);
  });
});
