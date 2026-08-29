import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import {
  canAccessAdminControlPlane,
  hasPermission,
  isStaffAdminRole,
  isSuperAdminRole,
} from '@/utils/role-strategy/helpers';

describe('staff admin access', () => {
  it('treats super_admin and assistant_admin as staff', () => {
    expect(isStaffAdminRole('super_admin')).toBe(true);
    expect(isStaffAdminRole('assistant_admin')).toBe(true);
    expect(isStaffAdminRole('student')).toBe(false);
    expect(isSuperAdminRole('assistant_admin')).toBe(false);
  });

  it('lets assistant_admin into admin modules except org accounts and term settings', () => {
    expect(
      canAccessAdminControlPlane(
        'assistant_admin',
        RouteService.karvita.adminDashboard()
      )
    ).toBe(true);
    expect(
      canAccessAdminControlPlane(
        'assistant_admin',
        RouteService.karvita.organizationalStructure()
      )
    ).toBe(true);
    expect(
      canAccessAdminControlPlane(
        'assistant_admin',
        RouteService.karvita.syllabusCourseOfferings()
      )
    ).toBe(true);
    expect(
      canAccessAdminControlPlane(
        'assistant_admin',
        RouteService.karvita.adminUserCreation()
      )
    ).toBe(false);
    expect(
      canAccessAdminControlPlane(
        'assistant_admin',
        RouteService.karvita.syllabusTermSettings()
      )
    ).toBe(false);
    expect(
      canAccessAdminControlPlane(
        'super_admin',
        RouteService.karvita.adminUserCreation()
      )
    ).toBe(true);
    expect(
      canAccessAdminControlPlane(
        'super_admin',
        RouteService.karvita.syllabusTermSettings()
      )
    ).toBe(true);
    expect(
      canAccessAdminControlPlane(
        'student',
        RouteService.karvita.adminDashboard()
      )
    ).toBe(false);
  });

  it('does not grant user.create or syllabus.term-settings to assistant_admin', () => {
    expect(
      hasPermission({ role: 'assistant_admin' }, 'user.create')
    ).toBe(false);
    expect(
      hasPermission({ role: 'assistant_admin' }, 'syllabus.term-settings')
    ).toBe(false);
    expect(hasPermission({ role: 'super_admin' }, 'user.create')).toBe(true);
    expect(
      hasPermission({ role: 'super_admin' }, 'syllabus.term-settings')
    ).toBe(true);
    expect(
      hasPermission({ role: 'assistant_admin' }, 'organization.manage')
    ).toBe(true);
    expect(
      hasPermission({ role: 'assistant_admin' }, 'syllabus.manage')
    ).toBe(true);
  });
});
