import { describe, expect, it } from 'vitest';

import { USER_ROLES, isUserRole, parseUserRole } from '@/utils/userRole';

describe('userRole', () => {
  it('lists every RoleStrategyMap key', () => {
    expect(USER_ROLES).toContain('student');
    expect(USER_ROLES).toContain('super_admin');
    expect(USER_ROLES.length).toBeGreaterThanOrEqual(11);
  });

  it('accepts known profile route roles', () => {
    expect(isUserRole('student')).toBe(true);
    expect(parseUserRole('mentor_teacher')).toBe('mentor_teacher');
  });

  it('rejects unknown slugs', () => {
    expect(isUserRole('admin')).toBe(false);
    expect(parseUserRole('unknown-role')).toBeNull();
  });
});
