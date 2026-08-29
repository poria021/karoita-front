import { describe, expect, it } from 'vitest';

import {
  getOrgAccountRoleOptionsForKind,
  isOrgAccountRoleAllowedForKind,
} from './constants';

describe('getOrgAccountRoleOptionsForKind', () => {
  it('shows only assistant_admin for the admin kind', () => {
    expect(getOrgAccountRoleOptionsForKind('admin').map((option) => option.value)).toEqual([
      'assistant_admin',
    ]);
    expect(getOrgAccountRoleOptionsForKind('admin').map((option) => option.label)).toEqual([
      'دستیار مدیر ارشد',
    ]);
  });

  it('shows organizational roles for the user kind', () => {
    expect(getOrgAccountRoleOptionsForKind('user').map((option) => option.value)).toEqual([
      'central_organization',
      'provincial_university',
      'faculty_role',
      'regional_edu_admin',
    ]);
  });
});

describe('isOrgAccountRoleAllowedForKind', () => {
  it('accepts staff roles only on the admin kind', () => {
    expect(isOrgAccountRoleAllowedForKind('super_admin', 'admin')).toBe(false);
    expect(isOrgAccountRoleAllowedForKind('assistant_admin', 'admin')).toBe(true);
    expect(isOrgAccountRoleAllowedForKind('central_organization', 'admin')).toBe(
      false
    );
  });

  it('rejects assistant_admin on the organizational user kind', () => {
    expect(isOrgAccountRoleAllowedForKind('assistant_admin', 'user')).toBe(
      false
    );
    expect(isOrgAccountRoleAllowedForKind('faculty_role', 'user')).toBe(true);
  });
});
