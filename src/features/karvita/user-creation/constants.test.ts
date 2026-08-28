import { describe, expect, it } from 'vitest';

import {
  getOrgAccountRoleOptionsForKind,
  isOrgAccountRoleAllowedForKind,
} from './constants';

describe('getOrgAccountRoleOptionsForKind', () => {
  it('shows super_admin and assistant_admin for the user kind', () => {
    expect(getOrgAccountRoleOptionsForKind('user').map((option) => option.value)).toEqual([
      'super_admin',
      'assistant_admin',
    ]);
    expect(getOrgAccountRoleOptionsForKind('user').map((option) => option.label)).toEqual([
      'ادمین کل',
      'دستیار ادمین',
    ]);
  });

  it('shows current org roles except assistant_admin for the admin kind', () => {
    expect(getOrgAccountRoleOptionsForKind('admin').map((option) => option.value)).toEqual([
      'central_organization',
      'provincial_university',
      'faculty_role',
      'regional_edu_admin',
    ]);
  });
});

describe('isOrgAccountRoleAllowedForKind', () => {
  it('accepts staff roles only on the user kind', () => {
    expect(isOrgAccountRoleAllowedForKind('super_admin', 'user')).toBe(true);
    expect(isOrgAccountRoleAllowedForKind('assistant_admin', 'user')).toBe(true);
    expect(isOrgAccountRoleAllowedForKind('central_organization', 'user')).toBe(
      false
    );
  });

  it('rejects assistant_admin on the organizational-role kind', () => {
    expect(isOrgAccountRoleAllowedForKind('assistant_admin', 'admin')).toBe(
      false
    );
    expect(isOrgAccountRoleAllowedForKind('faculty_role', 'admin')).toBe(true);
  });
});
