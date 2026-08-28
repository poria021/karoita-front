import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminUserCreationService } from '@/services/admin-user-creation.service';
import { adminsApi } from '@/services/admin-user-creation/real/admins.api';
import { ApiClientError } from '@/services/api-error';
import {
  readMockUsers,
  resetMockAuthStoreForTests,
} from '@/services/auth/mock/mock-auth.store';
import {
  AUTH_MOCK_USERS,
  MOCK_SUPER_ADMIN_MOBILE,
} from '@/services/auth/mock/auth-mock-users';
import { useUserStore } from '@/store/useUserStore';

vi.mock('@/services/admin-user-creation/real/admins.api', () => ({
  adminsApi: {
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

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

describe('AdminUserCreationService (real staff admin)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(adminsApi.create).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('POSTs /api/v1/admin/admins for assistant_admin', async () => {
    vi.mocked(adminsApi.create).mockResolvedValue({
      id: 'adm-1',
      fname: 'سارا',
      lname: 'محمدی',
      phone: '09111111111',
      status: { id: 'st-1', name: 'active' },
      role: 'admin',
      createdAt: '2026-08-28T11:38:05.046Z',
      updatedAt: '2026-08-28T11:38:05.046Z',
    });

    const result = await AdminUserCreationService.createOrganizationalUser({
      firstName: 'سارا',
      lastName: 'محمدی',
      mobile: '9111111111',
      password: '12345678',
      role: 'assistant_admin',
    });

    expect(adminsApi.create).toHaveBeenCalledWith({
      fname: 'سارا',
      lname: 'محمدی',
      phone: '09111111111',
      role: 'admin',
    });
    expect(result.user.id).toBe('adm-1');
    expect(result.user.role).toBe('assistant_admin');
    expect(result.user.approved).toBe(true);
  });

  it('POSTs Nest role superadmin for super_admin', async () => {
    vi.mocked(adminsApi.create).mockResolvedValue({
      id: 'adm-2',
      fname: 'سارا',
      lname: 'محمدی',
      phone: '09111111112',
      status: { id: 'st-1', name: 'active' },
      role: 'superadmin',
      createdAt: '2026-08-28T11:38:05.046Z',
      updatedAt: '2026-08-28T11:38:05.046Z',
    });

    const result = await AdminUserCreationService.createOrganizationalUser({
      firstName: 'سارا',
      lastName: 'محمدی',
      mobile: '9111111112',
      password: '12345678',
      role: 'super_admin',
    });

    expect(adminsApi.create).toHaveBeenCalledWith({
      fname: 'سارا',
      lname: 'محمدی',
      phone: '09111111112',
      role: 'superadmin',
    });
    expect(result.user.role).toBe('super_admin');
  });

  it('does not call /admin/admins for organizational roles', async () => {
    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: '9111111113',
        password: '12345678',
        role: 'central_organization',
      })
    ).rejects.toThrow(/userId/);

    expect(adminsApi.create).not.toHaveBeenCalled();
  });

  it('maps Nest 409 to the duplicate-mobile message', async () => {
    vi.mocked(adminsApi.create).mockRejectedValue(
      new ApiClientError('conflict', 409)
    );

    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: '9111111114',
        password: '12345678',
        role: 'assistant_admin',
      })
    ).rejects.toThrow(/موبایل/);
  });
});
