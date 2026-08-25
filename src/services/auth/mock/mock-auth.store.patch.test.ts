import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_MOCK_USERS } from '@/services/auth/mock/auth-mock-users';
import {
  findMockUserById,
  patchMockAuthUser,
  readMockUsers,
  resetMockAuthStoreForTests,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.store';
import { useUserStore } from '@/store/useUserStore';

describe('patchMockAuthUser', () => {
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

  it('updates the auth mock directory and preserves password', () => {
    const seed = readMockUsers()[0];
    expect(seed).toBeTruthy();
    const beforePassword = seed.password;

    const updated = patchMockAuthUser(
      { id: seed.id },
      { firstName: 'آزمایش', lastName: 'یکپارچه' }
    );

    expect(updated.firstName).toBe('آزمایش');
    expect(updated.password).toBe(beforePassword);
    expect(findMockUserById(seed.id)?.firstName).toBe('آزمایش');
  });

  it('syncs Zustand when the active user matches', () => {
    const seed = readMockUsers()[0];
    useUserStore.getState().setUser(toPublicUser(seed));

    patchMockAuthUser({ id: seed.id }, { firstName: 'همگام' });

    expect(useUserStore.getState().activeUser?.firstName).toBe('همگام');
  });
});
