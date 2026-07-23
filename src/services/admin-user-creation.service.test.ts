import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminUserCreationService } from '@/services/admin-user-creation.service';
import {
  readMockUsers,
  resetMockAuthStoreForTests,
} from '@/services/auth/mock-auth.store';
import {
  AUTH_MOCK_USERS,
  MOCK_SUPER_ADMIN_MOBILE,
} from '@/services/mock/auth-mock-users';
import { useUserStore } from '@/store/useUserStore';

describe('AdminUserCreationService (mock)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.getState().setUser({
      id: '#MOCK-SA',
      firstName: 'مدیر',
      lastName: 'ارشد',
      mobile: MOCK_SUPER_ADMIN_MOBILE,
      role: 'super_admin',
      approved: true,
      docStatus: 'approved',
      hasPassword: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetMockAuthStoreForTests();
    useUserStore.setState({ activeUser: null });
  });

  it('creates an approved organizational user', async () => {
    const before = readMockUsers().length;
    const result = await AdminUserCreationService.createOrganizationalUser({
      firstName: 'سارا',
      lastName: 'محمدی',
      mobile: '9111111111',
      password: '12345678',
      role: 'central_organization',
    });

    expect(result.user.role).toBe('central_organization');
    expect(result.user.approved).toBe(true);
    expect(result.user.docStatus).toBe('approved');
    expect(result.user.hasPassword).toBe(true);
    expect(readMockUsers()).toHaveLength(before + 1);
  });

  it('rejects duplicate mobile', async () => {
    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: MOCK_SUPER_ADMIN_MOBILE,
        password: '12345678',
        role: 'assistant_admin',
      })
    ).rejects.toThrow(/موبایل/);
  });

  it('reports mobile availability', async () => {
    const taken = await AdminUserCreationService.checkMobileAvailable(
      MOCK_SUPER_ADMIN_MOBILE
    );
    expect(taken.available).toBe(false);

    const free = await AdminUserCreationService.checkMobileAvailable(
      '9111111112'
    );
    expect(free.available).toBe(true);
  });
});
