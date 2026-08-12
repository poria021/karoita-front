import { describe, expect, it, beforeEach } from 'vitest';

import {
  buildMockAuthIndexes,
  getMockUserByMobile,
} from '@/services/auth/mock-auth.indexes';
import {
  mockLoginWithCredentials,
  mockRegister,
  mockResetPassword,
  mockVerifyRegistrationOtp,
} from '@/services/auth/mock-auth.operations';
import {
  findMockUserByMobile,
  readMockUsers,
  resetMockAuthStoreForTests,
} from '@/services/auth/mock-auth.store';
import {
  AUTH_MOCK_USERS,
  MOCK_OTP_CODE,
  MOCK_USER_PASSWORD,
  type MockAuthUserRecord,
} from '@/services/auth/auth-mock-users';

describe('buildMockAuthIndexes', () => {
  it('resolves existing and missing mobiles in O(1) map lookup', () => {
    const indexes = buildMockAuthIndexes(AUTH_MOCK_USERS);
    const known = AUTH_MOCK_USERS[0]!;
    expect(getMockUserByMobile(indexes, known.mobile)?.id).toBe(known.id);
    expect(getMockUserByMobile(indexes, '0999999999')).toBeUndefined();
  });
});

describe('mock auth store index updates', () => {
  beforeEach(() => {
    resetMockAuthStoreForTests(
      AUTH_MOCK_USERS.map((u) => ({ ...u })) as MockAuthUserRecord[]
    );
  });

  it('indexes a user after registration OTP', () => {
    const mobile = '9111111111';
    expect(findMockUserByMobile(mobile)).toBeUndefined();
    mockRegister(mobile);
    mockVerifyRegistrationOtp(mobile, MOCK_OTP_CODE, 'student');
    expect(findMockUserByMobile(mobile)?.mobile).toBe(mobile);
    expect(readMockUsers().some((u) => u.mobile === mobile)).toBe(true);
  });

  it('keeps index coherent after password reset', () => {
    const seed = AUTH_MOCK_USERS[0]!;
    mockResetPassword(seed.mobile, MOCK_OTP_CODE, 'new-pass-99');
    const updated = findMockUserByMobile(seed.mobile);
    expect(updated?.password).toBe('new-pass-99');
    expect(updated?.hasPassword).toBe(true);
    expect(() =>
      mockLoginWithCredentials(seed.mobile, MOCK_USER_PASSWORD)
    ).toThrow();
    expect(mockLoginWithCredentials(seed.mobile, 'new-pass-99').mobile).toBe(
      seed.mobile
    );
  });
});
