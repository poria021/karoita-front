import { describe, expect, it } from 'vitest';

import {
  isOrgManagementRole,
  isProvisionableAccountRole,
  isStaffAdminRole,
  ORG_MANAGEMENT_ROLES,
  PROVISIONABLE_ACCOUNT_ROLES,
  STAFF_ADMIN_ROLES,
} from '@/types/role-taxonomy';

describe('role-taxonomy', () => {
  it('partitions provisionable roles into org management and staff admin', () => {
    expect(PROVISIONABLE_ACCOUNT_ROLES).toEqual([
      ...ORG_MANAGEMENT_ROLES,
      ...STAFF_ADMIN_ROLES,
    ]);
    expect(STAFF_ADMIN_ROLES).toEqual(['super_admin', 'assistant_admin']);
    expect(ORG_MANAGEMENT_ROLES).toEqual([
      'central_organization',
      'provincial_university',
      'faculty_role',
      'regional_edu_admin',
    ]);
  });

  it('classifies staff and org management roles', () => {
    expect(isStaffAdminRole('assistant_admin')).toBe(true);
    expect(isStaffAdminRole('faculty_role')).toBe(false);
    expect(isOrgManagementRole('faculty_role')).toBe(true);
    expect(isOrgManagementRole('super_admin')).toBe(false);
    expect(isProvisionableAccountRole('super_admin')).toBe(true);
    expect(isProvisionableAccountRole('student')).toBe(false);
  });
});
