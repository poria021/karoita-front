import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminUserCreationService } from '@/services/admin-user-creation.service';
import { OnboardingApprovalsService } from '@/services/onboarding-approvals.service';
import { adminsApi } from '@/services/admin-user-creation/real/admins.api';
import { accountUsersApi } from '@/services/admin-user-creation/real/account-users.api';
import { ApiClientError } from '@/services/api-error';
import { usersApi } from '@/services/users/users.api';
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

vi.mock('@/services/admin-user-creation/real/account-users.api', () => ({
  accountUsersApi: {
    create: vi.fn(),
    list: vi.fn(),
    listRoles: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/services/users/users.api', () => ({
  usersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

// resolveOrgAccountLocationIds resolves the form's province/city/district labels
// against this — echo the query back as both id and label so existing
// province/city/district test fixtures ('prov-1', 'city-1', ...) still round-trip.
vi.mock('@/services/organization-options.service', () => ({
  OrganizationOptionsService: {
    getOptions: vi.fn(async ({ query }: { query?: string }) => ({
      items: query ? [{ id: query, label: query }] : [],
      hasMore: false,
      page: 1,
    })),
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

    const approved = await OnboardingApprovalsService.listPage({
      status: 'approved',
      query: '9111111111',
      province: 'all',
      offset: 0,
      limit: 20,
    });
    expect(approved.items.some((user) => user.id === result.user.id)).toBe(true);
  });

  it('puts a created staff admin on the approved identity tab', async () => {
    const result = await AdminUserCreationService.createOrganizationalUser({
      firstName: 'سارا',
      lastName: 'محمدی',
      mobile: '9111111199',
      password: '12345678',
      role: 'assistant_admin',
    });

    expect(result.user.approved).toBe(true);
    expect(result.user.docStatus).toBe('approved');

    const approved = await OnboardingApprovalsService.listPage({
      status: 'approved',
      query: '9111111199',
      province: 'all',
      offset: 0,
      limit: 20,
    });
    expect(approved.items.some((user) => user.id === result.user.id)).toBe(true);
  });

  it('rejects creating super_admin', async () => {
    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: '9111111188',
        password: '12345678',
        role: 'super_admin',
      } as never)
    ).rejects.toThrow(/مدیر ارشد/);
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

  it('lists staff admins from the mock store', async () => {
    const page = await AdminUserCreationService.listStaffAdmins({
      offset: 0,
      limit: 20,
    });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((item) => item.role === 'super_admin' || item.role === 'assistant_admin')).toBe(true);
  });

  it('gets a staff admin by id from the mock store', async () => {
    const page = await AdminUserCreationService.listStaffAdmins({
      offset: 0,
      limit: 20,
    });
    const first = page.items[0];
    expect(first).toBeTruthy();
    if (!first) return;
    const detail = await AdminUserCreationService.getStaffAdmin(first.id);
    expect(detail.id).toBe(first.id);
    expect(detail.mobile).toBe(first.mobile);
  });

  it('updates a staff admin in the mock store', async () => {
    const page = await AdminUserCreationService.listStaffAdmins({
      offset: 0,
      limit: 20,
    });
    const first = page.items[0];
    expect(first).toBeTruthy();
    if (!first) return;

    const updated = await AdminUserCreationService.updateStaffAdmin(first.id, {
      firstName: 'علی',
      lastName: 'رضایی',
      mobile: first.mobile,
      role: first.role,
      active: false,
    });

    expect(updated.firstName).toBe('علی');
    expect(updated.lastName).toBe('رضایی');
    expect(updated.role).toBe(first.role);
    expect(updated.statusName).toBe('inactive');
  });
});

describe('AdminUserCreationService (real staff admin)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(adminsApi.create).mockReset();
    vi.mocked(adminsApi.list).mockReset();
    vi.mocked(adminsApi.getById).mockReset();
    vi.mocked(adminsApi.update).mockReset();
    vi.mocked(usersApi.list).mockReset();
    vi.mocked(accountUsersApi.create).mockReset();
    vi.mocked(accountUsersApi.list).mockReset();
    vi.mocked(accountUsersApi.listRoles).mockReset();
    vi.mocked(accountUsersApi.getById).mockReset();
    vi.mocked(accountUsersApi.update).mockReset();
    vi.mocked(accountUsersApi.remove).mockReset();
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

  it('does not POST super_admin to /admin/admins', async () => {
    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: '9111111112',
        password: '12345678',
        role: 'super_admin',
      } as never)
    ).rejects.toThrow(/مدیر ارشد/);

    expect(adminsApi.create).not.toHaveBeenCalled();
  });

  it('does not call /admin/admins for organizational roles', async () => {
    vi.mocked(accountUsersApi.listRoles).mockResolvedValue([
      { id: 'role-central', name: 'organization_center' },
    ]);
    vi.mocked(accountUsersApi.create).mockResolvedValue({
      id: 'acc-1',
      phone: '09111111113',
      firstName: 'سارا',
      lastName: 'محمدی',
      role: { id: 'role-central', name: 'organization_center' },
      status: { id: 'st-1', name: 'active' },
      createdAt: '2026-08-28T11:38:05.046Z',
      updatedAt: '2026-08-28T11:38:05.046Z',
    });

    await AdminUserCreationService.createOrganizationalUser({
      firstName: 'سارا',
      lastName: 'محمدی',
      mobile: '9111111113',
      password: '12345678',
      role: 'central_organization',
    });

    expect(adminsApi.create).not.toHaveBeenCalled();
  });

  it('POSTs /api/v1/admin/account-users for an organizational role, resolving the role id first', async () => {
    vi.mocked(accountUsersApi.listRoles).mockResolvedValue([
      { id: 'role-regional', name: 'school_district' },
      { id: 'role-central', name: 'organization_center' },
    ]);
    vi.mocked(accountUsersApi.create).mockResolvedValue({
      id: 'acc-2',
      phone: '09111111115',
      firstName: 'سارا',
      lastName: 'محمدی',
      role: { id: 'role-regional', name: 'school_district' },
      status: { id: 'st-1', name: 'active' },
      city: [{ id: 'c-1', title: 'تهران' }],
      educationalDistrict: [{ id: 'd-1', title: 'منطقه ۲' }],
      createdAt: '2026-08-28T11:38:05.046Z',
      updatedAt: '2026-08-28T11:38:05.046Z',
    });

    const result = await AdminUserCreationService.createOrganizationalUser({
      firstName: 'سارا',
      lastName: 'محمدی',
      mobile: '9111111115',
      password: '12345678',
      role: 'regional_edu_admin',
      province: 'prov-1',
      city: 'city-1',
      district: 'dist-1',
    });

    expect(accountUsersApi.create).toHaveBeenCalledWith({
      fname: 'سارا',
      lname: 'محمدی',
      phone: '09111111115',
      password: '12345678',
      role: 'role-regional',
      province: 'prov-1',
      city: 'city-1',
      educationDistrict: 'dist-1',
    });
    expect(result.user.id).toBe('acc-2');
    expect(result.user.role).toBe('regional_edu_admin');
    expect(result.user.approved).toBe(true);
    expect(result.user.docStatus).toBe('approved');
    expect(result.user.city).toEqual(['تهران']);
    expect(result.user.district).toEqual(['منطقه ۲']);
  });

  it('rejects organizational creation when the role id cannot be resolved', async () => {
    vi.mocked(accountUsersApi.listRoles).mockResolvedValue([
      { id: 'role-central', name: 'organization_center' },
    ]);

    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: '9111111116',
        password: '12345678',
        role: 'faculty_role',
      })
    ).rejects.toThrow();

    expect(accountUsersApi.create).not.toHaveBeenCalled();
  });

  it('surfaces the Nest 409 body instead of a frontend duplicate-mobile copy', async () => {
    vi.mocked(adminsApi.create).mockRejectedValue(
      new ApiClientError('phone already exists', 409)
    );

    await expect(
      AdminUserCreationService.createOrganizationalUser({
        firstName: 'سارا',
        lastName: 'محمدی',
        mobile: '9111111114',
        password: '12345678',
        role: 'assistant_admin',
      })
    ).rejects.toThrow('phone already exists');
  });

  it('lists staff admins from GET /admin/admins', async () => {
    vi.mocked(adminsApi.list).mockResolvedValue({
      data: [
        {
          id: 'adm-1',
          firstName: 'Ali',
          lastName: 'Rezaei',
          mobile: '09386951413',
          role: 'assistant_admin',
          statusName: 'active',
          createdAt: '2026-08-29T14:11:55.298Z',
        },
      ],
      hasNextPage: false,
    });

    const page = await AdminUserCreationService.listStaffAdmins({
      offset: 0,
      limit: 20,
    });

    expect(adminsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(page.items[0]?.id).toBe('adm-1');
    expect(page.hasMore).toBe(false);
  });

  it('gets a staff admin from GET /admin/admins/{id}', async () => {
    vi.mocked(adminsApi.getById).mockResolvedValue({
      id: 'adm-1',
      firstName: 'Ali',
      lastName: 'Rezaei',
      mobile: '09386951413',
      role: 'assistant_admin',
      statusName: 'active',
      createdAt: '2026-08-29T14:11:55.298Z',
    });

    const detail = await AdminUserCreationService.getStaffAdmin('adm-1');

    expect(adminsApi.getById).toHaveBeenCalledWith('adm-1');
    expect(detail.firstName).toBe('Ali');
  });

  it('PUTs /admin/admins/{id} with Nest status 2', async () => {
    vi.mocked(adminsApi.update).mockResolvedValue({
      id: 'adm-1',
      firstName: 'Ali',
      lastName: 'Rezaei',
      mobile: '09386951413',
      role: 'super_admin',
      statusName: 'active',
      statusCode: 2,
      createdAt: '2026-08-29T14:11:55.298Z',
    });

    const detail = await AdminUserCreationService.updateStaffAdmin('adm-1', {
      firstName: 'Ali',
      lastName: 'Rezaei',
      mobile: '9386951413',
      role: 'super_admin',
      active: true,
    });

    expect(adminsApi.update).toHaveBeenCalledWith('adm-1', {
      fname: 'Ali',
      lname: 'Rezaei',
      phone: '09386951413',
      role: 'superadmin',
      status: 2,
    });
    expect(detail.statusName).toBe('active');
  });

  it('lists org account users from GET /admin/account-users', async () => {
    vi.mocked(accountUsersApi.list).mockResolvedValue({
      data: [
        {
          id: 'acc-1',
          phone: '09111111113',
          firstName: 'سارا',
          lastName: 'محمدی',
          role: { id: 'role-central', name: 'organization_center' },
          status: { id: 'st-1', name: 'active' },
          createdAt: '2026-08-28T11:38:05.046Z',
          updatedAt: '2026-08-28T11:38:05.046Z',
        },
      ],
      hasNextPage: false,
    });

    const page = await AdminUserCreationService.listOrgAccountUsers({
      offset: 0,
      limit: 20,
      role: 'central_organization',
    });

    expect(accountUsersApi.list).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      role: 'central_organization',
    });
    expect(page.items[0]?.id).toBe('acc-1');
    expect(page.items[0]?.role).toBe('central_organization');
    expect(page.hasMore).toBe(false);
  });

  it('gets an org account user from GET /admin/account-users/{id}', async () => {
    vi.mocked(accountUsersApi.getById).mockResolvedValue({
      id: 'acc-1',
      phone: '09111111113',
      firstName: 'سارا',
      lastName: 'محمدی',
      role: { id: 'role-central', name: 'organization_center' },
      status: { id: 'st-1', name: 'active' },
      createdAt: '2026-08-28T11:38:05.046Z',
      updatedAt: '2026-08-28T11:38:05.046Z',
    });

    const detail = await AdminUserCreationService.getOrgAccountUser('acc-1');

    expect(accountUsersApi.getById).toHaveBeenCalledWith('acc-1');
    expect(detail.firstName).toBe('سارا');
  });

  it('PATCHes /admin/account-users/{id} after resolving the role id', async () => {
    vi.mocked(accountUsersApi.listRoles).mockResolvedValue([
      { id: 'role-provincial', name: 'university_province' },
    ]);
    vi.mocked(accountUsersApi.update).mockResolvedValue({
      id: 'acc-1',
      phone: '09111111113',
      firstName: 'علی',
      lastName: 'رضایی',
      role: { id: 'role-provincial', name: 'university_province' },
      status: { id: 'st-1', name: 'active' },
      createdAt: '2026-08-28T11:38:05.046Z',
      updatedAt: '2026-08-28T11:38:05.046Z',
    });

    const detail = await AdminUserCreationService.updateOrgAccountUser('acc-1', {
      firstName: 'علی',
      lastName: 'رضایی',
      mobile: '9111111113',
      role: 'provincial_university',
      province: 'prov-1',
    });

    expect(accountUsersApi.update).toHaveBeenCalledWith('acc-1', {
      fname: 'علی',
      lname: 'رضایی',
      phone: '09111111113',
      role: 'role-provincial',
      province: 'prov-1',
    });
    expect(detail.firstName).toBe('علی');
  });

  it('DELETEs /admin/account-users/{id}', async () => {
    vi.mocked(accountUsersApi.remove).mockResolvedValue(null);

    await AdminUserCreationService.removeOrgAccountUser('acc-1');

    expect(accountUsersApi.remove).toHaveBeenCalledWith('acc-1');
  });

  it('does not treat an unrelated users-list row as a taken mobile', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [
        {
          id: 'user-1',
          phone: '09386951413',
          provider: '',
          socialId: '',
          firstName: 'Ali',
          lastName: 'Karimi',
          photo: { id: '', path: '' },
          role: { id: '1', name: 'student' },
          status: { id: '1', name: 'active' },
          userUniqueId: '',
          city: null,
          educationalDistrict: null,
          school: null,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
      ],
      hasNextPage: false,
    });

    const result = await AdminUserCreationService.checkMobileAvailable(
      '9445465457'
    );

    expect(usersApi.list).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      filters: JSON.stringify({ phone: '09445465457' }),
    });
    expect(result.available).toBe(true);
  });

  it('marks a mobile taken when the listed user phone matches', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [
        {
          id: 'user-1',
          phone: '09445465457',
          provider: '',
          socialId: '',
          firstName: 'Ali',
          lastName: 'Karimi',
          photo: { id: '', path: '' },
          role: { id: '1', name: 'student' },
          status: { id: '1', name: 'active' },
          userUniqueId: '',
          city: null,
          educationalDistrict: null,
          school: null,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
      ],
      hasNextPage: false,
    });

    const result = await AdminUserCreationService.checkMobileAvailable(
      '9445465457'
    );
    expect(result.available).toBe(false);
  });
});
