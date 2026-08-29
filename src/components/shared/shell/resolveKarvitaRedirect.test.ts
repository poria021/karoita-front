import { describe, expect, it } from 'vitest';

import { resolveKarvitaRedirect } from '@/components/shared/shell/resolveKarvitaRedirect';
import { RouteService } from '@/services/route.service';
import type { User } from '@/types/auth';

function user(partial: Partial<User> & Pick<User, 'role'>): User {
  return {
    id: 'u1',
    mobile: '9120000000',
    firstName: 'آزمایش',
    lastName: 'کاربر',
    approved: true,
    docStatus: 'approved',
    ...partial,
  };
}

describe('resolveKarvitaRedirect', () => {
  it('sends a locked student to their profile from any module path', () => {
    const locked = user({ role: 'student', approved: false });
    expect(
      resolveKarvitaRedirect(locked, RouteService.karvita.dashboard())
    ).toBe(RouteService.karvita.profile('student'));
    expect(
      resolveKarvitaRedirect(
        locked,
        RouteService.karvita.internshipSelection(1)
      )
    ).toBe(RouteService.karvita.profile('student'));
    expect(
      resolveKarvitaRedirect(locked, RouteService.karvita.profile('student'))
    ).toBeNull();
  });

  it('keeps an unlocked student on live modules and blocks admin plane', () => {
    const student = user({ role: 'student' });
    expect(
      resolveKarvitaRedirect(student, RouteService.karvita.dashboard())
    ).toBeNull();
    expect(
      resolveKarvitaRedirect(
        student,
        RouteService.karvita.organizationalStructure()
      )
    ).toBe(RouteService.karvita.dashboard());
  });

  it('sends staff off the user dashboard onto the admin home', () => {
    const admin = user({ role: 'super_admin' });
    expect(
      resolveKarvitaRedirect(admin, RouteService.karvita.dashboard())
    ).toBe(RouteService.karvita.adminDashboard());
    expect(
      resolveKarvitaRedirect(admin, RouteService.karvita.organizationalStructure())
    ).toBeNull();
  });
});
