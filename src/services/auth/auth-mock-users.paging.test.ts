import { describe, expect, it } from 'vitest';

import { AUTH_MOCK_USERS } from '@/services/auth/auth-mock-users';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

describe('auth mock users onboarding paging capacity', () => {
  it('has more than one page of users per onboarding docStatus tab', () => {
    const pending = AUTH_MOCK_USERS.filter(
      (u) => u.role !== 'super_admin' && u.docStatus === 'pending_admin'
    );
    const approved = AUTH_MOCK_USERS.filter(
      (u) => u.role !== 'super_admin' && u.docStatus === 'approved'
    );
    const rejected = AUTH_MOCK_USERS.filter(
      (u) => u.role !== 'super_admin' && u.docStatus === 'rejected'
    );

    expect(pending.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(approved.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(rejected.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
  });
});
