import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import {
  canAccessReturnPath,
  getPostLoginPath,
  resolvePostAuthPath,
} from '@/services/post-login-path';
import type { User } from '@/types/auth';

function user(partial: Partial<User> & Pick<User, 'role'>): User {
  return {
    id: 'u1',
    mobile: '09120000000',
    firstName: 'آزمایش',
    lastName: 'کاربر',
    approved: true,
    docStatus: 'approved',
    ...partial,
  } as User;
}

describe('getPostLoginPath', () => {
  it('routes super_admin to admin dashboard', () => {
    expect(getPostLoginPath(user({ role: 'super_admin' }))).toBe(
      RouteService.karvita.adminDashboard()
    );
  });

  it('routes locked student to profile', () => {
    expect(
      getPostLoginPath(user({ role: 'student', approved: false }))
    ).toBe(RouteService.karvita.profile('student'));
  });

  it('routes approved student to user dashboard', () => {
    expect(getPostLoginPath(user({ role: 'student' }))).toBe(
      RouteService.karvita.dashboard()
    );
  });
});

describe('resolvePostAuthPath / canAccessReturnPath', () => {
  it('honors safe returnUrl for allowed paths', () => {
    const student = user({ role: 'student' });
    expect(
      resolvePostAuthPath(
        student,
        RouteService.karvita.organizationalStructure()
      )
    ).toBe(RouteService.karvita.dashboard());

    expect(
      resolvePostAuthPath(student, RouteService.karvita.dashboard())
    ).toBe(RouteService.karvita.dashboard());
  });

  it('blocks admin returnUrl for non–super_admin', () => {
    const student = user({ role: 'student' });
    expect(
      canAccessReturnPath(
        student,
        RouteService.karvita.organizationalStructure()
      )
    ).toBe(false);
  });

  it('allows admin returnUrl for super_admin', () => {
    const admin = user({ role: 'super_admin' });
    expect(
      resolvePostAuthPath(
        admin,
        RouteService.karvita.organizationalStructure()
      )
    ).toBe(RouteService.karvita.organizationalStructure());
  });

  it('rejects open redirect payloads', () => {
    const student = user({ role: 'student' });
    expect(resolvePostAuthPath(student, '//evil.example')).toBe(
      RouteService.karvita.dashboard()
    );
  });

  it('rejects unfinished module paths', () => {
    const student = user({ role: 'student' });
    expect(
      resolvePostAuthPath(student, RouteService.karvita.dailyReports())
    ).toBe(RouteService.karvita.dashboard());
  });

  it('allows locked student only their canonical profile returnUrl', () => {
    const locked = user({ role: 'student', approved: false });
    expect(
      canAccessReturnPath(locked, RouteService.karvita.profile('student'))
    ).toBe(true);
    expect(
      canAccessReturnPath(
        locked,
        RouteService.karvita.profileSecurity('student')
      )
    ).toBe(true);
    expect(
      canAccessReturnPath(locked, RouteService.karvita.profile('skill_learner'))
    ).toBe(false);
    expect(canAccessReturnPath(locked, '/profile/identity')).toBe(false);
    expect(canAccessReturnPath(locked, '/profile/security')).toBe(false);
    expect(
      resolvePostAuthPath(locked, '/profile/identity')
    ).toBe(RouteService.karvita.profile('student'));
  });
});
