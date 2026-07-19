import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AUTH_ERR_ADMIN_GATE_ONLY,
  AUTH_ERR_USER_NOT_FOUND,
} from '@/services/auth/auth-error-messages';
import {
  mockLoginWithCredentials,
  mockSendAdminGateOtp,
  mockSendForgotPasswordOtp,
  mockSendLoginOtp,
  mockVerifyForgotPasswordOtp,
} from '@/services/auth/mock-auth.operations';
import { resetMockAuthStoreForTests } from '@/services/auth/mock-auth.store';
import {
  AUTH_MOCK_USERS,
  MOCK_OTP_CODE,
  MOCK_SUPER_ADMIN_MOBILE,
  MOCK_USER_PASSWORD,
} from '@/services/mock/auth-mock-users';
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

  it('rejects super_admin on public forgot OTP verify', () => {
    expect(() =>
      mockVerifyForgotPasswordOtp(MOCK_SUPER_ADMIN_MOBILE, MOCK_OTP_CODE)
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
