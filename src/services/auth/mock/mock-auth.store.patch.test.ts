import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_MOCK_USERS } from '@/services/auth/mock/auth-mock-users';
import {
  buildMockSession,
  dispatchSessionToStore,
  findMockUserById,
  patchMockAuthUser,
  readMockUsers,
  resetMockAuthStoreForTests,
  toPublicUser,
  tryRestoreMockSession,
} from '@/services/auth/mock/mock-auth.store';
import {
  LEGACY_USER_STORE_STORAGE_KEY,
  useUserStore,
} from '@/store/useUserStore';

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

describe('tryRestoreMockSession', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: false,
    });
    sessionStorage.removeItem(LEGACY_USER_STORE_STORAGE_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetMockAuthStoreForTests();
    useUserStore.setState({ activeUser: null, isAuthenticated: false });
  });

  it('rebuilds the user from the mock session cookie, not Web Storage', () => {
    const admin = AUTH_MOCK_USERS.find((user) => user.role === 'super_admin');
    if (!admin) throw new Error('seed missing super_admin');

    dispatchSessionToStore(buildMockSession(toPublicUser(admin)));
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
    });
    sessionStorage.setItem(
      LEGACY_USER_STORE_STORAGE_KEY,
      JSON.stringify({
        state: {
          activeUser: { ...admin, role: 'student', mobile: '0000000000' },
        },
      })
    );

    const restored = tryRestoreMockSession();

    expect(restored?.user.id).toBe(admin.id);
    expect(restored?.user.role).toBe('super_admin');
    expect(restored?.user.mobile).toBe(admin.mobile);
    expect(useUserStore.getState().activeUser?.id).toBe(admin.id);
  });
});
