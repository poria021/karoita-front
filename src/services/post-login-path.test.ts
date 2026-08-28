import { describe, expect, it } from 'vitest';

import { PlannedRoutes } from '@/services/planned-routes';
import { RouteService } from '@/services/route.service';
import {
  canAccessReturnPath,
  getPostLoginPath,
  resolveNearestLivePath,
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

  it('routes locked student to profile (home while locked)', () => {
    expect(
      getPostLoginPath(user({ role: 'student', approved: false }))
    ).toBe(RouteService.karvita.profile('student'));
  });

  it('routes unlocked student to user dashboard', () => {
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
      resolvePostAuthPath(student, PlannedRoutes.dailyReports())
    ).toBe(RouteService.karvita.dashboard());
  });

  it('routes locked student with dashboard returnUrl to profile', () => {
    const locked = user({ role: 'student', approved: false });
    expect(
      canAccessReturnPath(locked, RouteService.karvita.dashboard())
    ).toBe(false);
    expect(
      resolvePostAuthPath(locked, RouteService.karvita.dashboard())
    ).toBe(RouteService.karvita.profile('student'));
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

describe('resolveNearestLivePath', () => {
  it('walks up to a live sibling parent for unlocked students', () => {
    const student = user({ role: 'student' });
    expect(
      resolveNearestLivePath(
        `${RouteService.karvita.dailyApprovals()}/missing-row`,
        student
      )
    ).toBe(RouteService.karvita.dailyApprovals());
  });

  it('walks up to live admin module for super_admin', () => {
    const admin = user({ role: 'super_admin' });
    expect(
      resolveNearestLivePath(
        `${RouteService.karvita.syllabusCourseOfferings()}/nope`,
        admin
      )
    ).toBe(RouteService.karvita.syllabusCourseOfferings());
  });

  it('picks longest shared-prefix live admin path when parent is not live', () => {
    const admin = user({ role: 'super_admin' });
    expect(
      resolveNearestLivePath('/karvita/admin/missing-module/x', admin)
    ).toBe(RouteService.karvita.adminDashboard());
  });

  it('skips admin ancestors for non–super_admin and falls back to role home', () => {
    const student = user({ role: 'student' });
    expect(
      resolveNearestLivePath(
        `${RouteService.karvita.organizationalStructure()}/ghost`,
        student
      )
    ).toBe(RouteService.karvita.dashboard());
  });

  it('does not treat sibling modules as nearest for random /karvita junk', () => {
    const student = user({ role: 'student' });
    expect(resolveNearestLivePath('/karvita/asdfgh', student)).toBe(
      RouteService.karvita.dashboard()
    );
  });

  it('resolves marketing ancestors for anonymous users (not /)', () => {
    expect(
      resolveNearestLivePath(
        `${RouteService.marketing.loginSelect()}/missing`,
        null
      )
    ).toBe(RouteService.marketing.loginSelect());
  });

  it('falls back to marketing home for anonymous junk paths', () => {
    expect(resolveNearestLivePath('/totally-missing/page', null)).toBe(
      RouteService.marketing.home()
    );
  });

  it('uses marketing home only as anonymous fallback, not for logged-in users', () => {
    const student = user({ role: 'student' });
    expect(resolveNearestLivePath('/unknown', student)).toBe(
      RouteService.karvita.dashboard()
    );
    expect(resolveNearestLivePath('/unknown', null)).toBe(
      RouteService.marketing.home()
    );
  });

  it('recovers auth typos to login instead of landing', () => {
    expect(resolveNearestLivePath('/auth/loginn', null)).toBe(
      RouteService.auth.login()
    );
    expect(resolveNearestLivePath('/auth/xyz', null)).toBe(
      RouteService.auth.login()
    );
    expect(resolveNearestLivePath('/autth/login', null)).toBe(
      RouteService.auth.login()
    );
  });

  it('walks up exact auth parents before fuzzy matching', () => {
    expect(
      resolveNearestLivePath(`${RouteService.auth.login()}/extra`, null)
    ).toBe(RouteService.auth.login());
    expect(
      resolveNearestLivePath(`${RouteService.auth.forgot()}/extra`, null)
    ).toBe(RouteService.auth.forgot());
  });
});
