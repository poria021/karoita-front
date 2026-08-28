import { afterEach, describe, expect, it } from 'vitest';

import type { User } from '@/types/auth';
import {
  LEGACY_USER_STORE_STORAGE_KEY,
  purgeLegacyUserStorePersistence,
  useUserStore,
} from '@/store/useUserStore';

const sampleUser: User = {
  id: '#MOCK-A1',
  firstName: 'ادمین',
  lastName: 'سیستم',
  mobile: '9123456786',
  role: 'super_admin',
  approved: true,
  docStatus: 'approved',
};

function storageValues(storage: Storage): string[] {
  const values: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    values.push(storage.getItem(key) ?? '');
  }
  return values;
}

describe('useUserStore', () => {
  afterEach(() => {
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: false,
    });
    sessionStorage.clear();
    localStorage.clear();
  });

  it('does not expose a persist API', () => {
    expect('persist' in useUserStore).toBe(false);
  });

  it('keeps activeUser in memory and never writes PII or role to Web Storage', () => {
    useUserStore.getState().setUser(sampleUser);

    expect(useUserStore.getState().activeUser?.mobile).toBe(sampleUser.mobile);
    expect(useUserStore.getState().isAuthenticated).toBe(true);
    expect(sessionStorage.getItem(LEGACY_USER_STORE_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_USER_STORE_STORAGE_KEY)).toBeNull();

    const leaked = [...storageValues(sessionStorage), ...storageValues(localStorage)]
      .join('\n');
    expect(leaked).not.toContain(sampleUser.mobile);
    expect(leaked).not.toContain(sampleUser.role);
    expect(leaked).not.toContain(sampleUser.firstName);
  });

  it('wipes a leftover persisted profile from previous builds', () => {
    const stale = JSON.stringify({
      state: {
        activeUser: sampleUser,
        isAuthenticated: true,
      },
    });
    sessionStorage.setItem(LEGACY_USER_STORE_STORAGE_KEY, stale);
    localStorage.setItem(LEGACY_USER_STORE_STORAGE_KEY, stale);

    purgeLegacyUserStorePersistence();

    expect(sessionStorage.getItem(LEGACY_USER_STORE_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_USER_STORE_STORAGE_KEY)).toBeNull();
    expect(useUserStore.getState().activeUser).toBeNull();
  });
});
