import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AUTH_ERR_ADMIN_GATE_ONLY,
  AUTH_ERR_OLD_PASSWORD_WRONG,
  AUTH_ERR_SESSION_REQUIRED,
  AUTH_ERR_USER_NOT_FOUND,
} from '@/services/auth/real/auth-error-messages';
import {
  mockLoginWithCredentials,
  mockSendAdminGateOtp,
  mockSendForgotPasswordOtp,
  mockSendLoginOtp,
  mockResetPassword,
  mockUpdateMe,
} from '@/services/auth/mock/mock-auth.operations';
import {
  findMockUserById,
  resetMockAuthStoreForTests,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.store';
import {
  AUTH_MOCK_USERS,
  MOCK_OTP_CODE,
  MOCK_SUPER_ADMIN_MOBILE,
  MOCK_USER_PASSWORD,
} from '@/services/auth/mock/auth-mock-users';
import { useUserStore } from '@/store/useUserStore';

function firstNonAdminMobile(): string {
  const row = AUTH_MOCK_USERS.find((u) => u.role !== 'super_admin');
  if (!row) throw new Error('seed missing non-admin user');
  return row.mobile;
}

describe('public auth audience (mock)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.setState({ activeUser: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetMockAuthStoreForTests();
  });

  it('rejects super_admin on public forgot OTP send', () => {
    expect(() => mockSendForgotPasswordOtp(MOCK_SUPER_ADMIN_MOBILE)).toThrow(
      AUTH_ERR_USER_NOT_FOUND
    );
  });

  it('rejects super_admin on public password reset', () => {
    expect(() =>
      mockResetPassword(MOCK_SUPER_ADMIN_MOBILE, MOCK_OTP_CODE, 'newPass12')
    ).toThrow(AUTH_ERR_USER_NOT_FOUND);
  });

  it('rejects super_admin on public password login', () => {
    expect(() =>
      mockLoginWithCredentials(MOCK_SUPER_ADMIN_MOBILE, MOCK_USER_PASSWORD)
    ).toThrow(AUTH_ERR_USER_NOT_FOUND);
  });

  it('rejects super_admin on public login OTP send', () => {
    expect(() => mockSendLoginOtp(MOCK_SUPER_ADMIN_MOBILE)).toThrow(
      AUTH_ERR_USER_NOT_FOUND
    );
  });

  it('allows a normal user on public forgot OTP send', () => {
    expect(() => mockSendForgotPasswordOtp(firstNonAdminMobile())).not.toThrow();
  });

  it('still allows super_admin on admin-gate OTP send', () => {
    expect(() => mockSendAdminGateOtp(MOCK_SUPER_ADMIN_MOBILE)).not.toThrow();
  });

  it('rejects non-admin on admin-gate OTP send', () => {
    expect(() => mockSendAdminGateOtp(firstNonAdminMobile())).toThrow(
      AUTH_ERR_ADMIN_GATE_ONLY
    );
  });
});

describe('mockUpdateMe (PATCH /auth/me)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.setState({ activeUser: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetMockAuthStoreForTests();
  });

  it('requires an active session', () => {
    expect(() => mockUpdateMe({ firstName: 'آزمایش' })).toThrow(
      AUTH_ERR_SESSION_REQUIRED
    );
  });

  it('updates identity fields on the active user', () => {
    const seed = AUTH_MOCK_USERS.find((u) => u.role !== 'super_admin');
    expect(seed).toBeTruthy();
    if (!seed) return;

    useUserStore.getState().setUser(toPublicUser(seed));
    const updated = mockUpdateMe({ firstName: 'نیما', lastName: 'رضایی' });

    expect(updated.firstName).toBe('نیما');
    expect(updated.lastName).toBe('رضایی');
    expect(findMockUserById(seed.id)?.firstName).toBe('نیما');
    expect(useUserStore.getState().activeUser?.firstName).toBe('نیما');
  });

  it('rejects a wrong current password', () => {
    const seed = AUTH_MOCK_USERS.find((u) => u.role !== 'super_admin');
    expect(seed).toBeTruthy();
    if (!seed) return;

    useUserStore.getState().setUser(toPublicUser(seed));
    expect(() =>
      mockUpdateMe({ oldPassword: 'wrong-pass', password: 'newPass12' })
    ).toThrow(AUTH_ERR_OLD_PASSWORD_WRONG);
    expect(findMockUserById(seed.id)?.password).toBe(MOCK_USER_PASSWORD);
  });

  it('changes password when the current password matches', () => {
    const seed = AUTH_MOCK_USERS.find((u) => u.role !== 'super_admin');
    expect(seed).toBeTruthy();
    if (!seed) return;

    useUserStore.getState().setUser(toPublicUser(seed));
    mockUpdateMe({ oldPassword: MOCK_USER_PASSWORD, password: 'newPass12' });

    expect(findMockUserById(seed.id)?.password).toBe('newPass12');
    expect(findMockUserById(seed.id)?.hasPassword).toBe(true);
  });
});
