import { describe, expect, it } from 'vitest';

import {
  fromNestRoleName,
  pickNestRoleDto,
  toNestRoleName,
} from '@/services/auth/nest-auth-role';

describe('nest-auth-role', () => {
  it('maps Nest role names back to FE roles', () => {
    expect(fromNestRoleName('trainee')).toBe('skill_learner');
    expect(fromNestRoleName('teacher')).toBe('mentor_teacher');
  });

  it('maps self-registerable FE roles to Nest RoleDto names', () => {
    expect(toNestRoleName('student')).toBe('student');
    expect(toNestRoleName('skill_learner')).toBe('trainee');
    expect(toNestRoleName('supervisor_professor')).toBe('mentor');
    expect(toNestRoleName('mentor_teacher')).toBe('teacher');
    expect(toNestRoleName('school_principal')).toBe('school_admin');
  });

  it('rejects roles that cannot self-register via Nest', () => {
    expect(() => toNestRoleName('super_admin')).toThrow(/پشتیبانی/);
  });

  it('picks Nest role id by mapped name', () => {
    const dto = pickNestRoleDto(
      [
        { id: 'role-student', name: 'student' },
        { id: 'role-trainee', name: 'trainee' },
      ],
      'skill_learner'
    );
    expect(dto).toEqual({ id: 'role-trainee', name: 'trainee' });
  });
});
