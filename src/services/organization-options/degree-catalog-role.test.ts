import { describe, expect, it } from 'vitest';

import {
  toDegreeCatalogRoleTitle,
  toMockMajorAudience,
} from '@/services/organization-options/degree-catalog-role';

describe('degree-catalog-role', () => {
  it('maps profile roles that have a major to Nest catalog titles', () => {
    expect(toDegreeCatalogRoleTitle('student')).toBe('student');
    expect(toDegreeCatalogRoleTitle('skill_learner')).toBe('trainee');
    expect(toDegreeCatalogRoleTitle('supervisor_professor')).toBe('mentor');
    expect(toDegreeCatalogRoleTitle('mentor_teacher')).toBe('teacher');
  });

  it('leaves staff roles without a degree catalog title', () => {
    expect(toDegreeCatalogRoleTitle('super_admin')).toBeUndefined();
    expect(toDegreeCatalogRoleTitle('faculty_role')).toBeUndefined();
  });

  it('maps mock majors to the profile audience enum', () => {
    expect(toMockMajorAudience('student')).toBe('student');
    expect(toMockMajorAudience('skill_learner')).toBe('skill_learner');
    expect(toMockMajorAudience('supervisor_professor')).toBe(
      'supervisor_professor'
    );
    expect(toMockMajorAudience('mentor_teacher')).toBeUndefined();
  });
});
