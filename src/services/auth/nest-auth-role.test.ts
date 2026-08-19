import { describe, expect, it } from 'vitest';

import {
  fromNestRoleName,
  nestRoleLabel,
  pickNestRoleDto,
  toNestRoleName,
} from '@/services/auth/nest-auth-role';

describe('nest-auth-role', () => {
  it('maps self-registerable FE roles to Nest RoleDto names', () => {
    expect(toNestRoleName('student')).toBe('student');
    expect(toNestRoleName('skill_learner')).toBe('trainee');
    expect(toNestRoleName('supervisor_professor')).toBe('mentor');
    expect(toNestRoleName('mentor_teacher')).toBe('teacher');
    expect(toNestRoleName('school_principal')).toBe('school_admin');
  });

  it('maps Nest RoleDto names back to FE roles', () => {
    expect(fromNestRoleName('trainee')).toBe('skill_learner');
    expect(fromNestRoleName('school_admin')).toBe('school_principal');
  });

  it('rejects roles that cannot self-register via Nest', () => {
    expect(() => toNestRoleName('super_admin')).toThrow(/پشتیبانی/);
  });

  it('reads live Nest role lists that use title instead of name', () => {
    const dto = pickNestRoleDto(
      [
        { id: 'role-mentor', name: 'mentor' },
      ],
      'supervisor_professor'
    );
    expect(dto.id).toBe('role-mentor');
    expect(nestRoleLabel({ title: 'mentor' })).toBe('mentor');
    expect(nestRoleLabel({ name: 'student' })).toBe('student');
  });
});
