import Cookies from 'js-cookie';

import { assertMockApiMode, isMockApiMode } from '@/lib/api-mode';
import { AUTH_COOKIE_NAME, MOCK_SESSION_MARKER } from '@/lib/config';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User } from '@/types/auth';

import {
  AUTH_MOCK_USERS,
  MOCK_USERS_SEED_VERSION,
  type MockAuthUserRecord,
} from '@/services/auth/auth-mock-users';
import {
  buildMockAuthIndexes,
  getMockUserById,
  getMockUserByMobile,
  type MockAuthIndexes,
} from '@/services/auth/mock-auth.indexes';

export const MOCK_USERS_STORAGE_KEY = 'karvita_mock_auth_users';
const MOCK_USERS_VERSION_KEY = 'karvita_mock_auth_users_version';
const SESSION_META_STORAGE_KEY = 'karvita_auth_session_meta';

export const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface SessionMeta {
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

let memoryUsers: MockAuthUserRecord[] | null = null;
let memoryIndexes: MockAuthIndexes | null = null;
let storageListenerBound = false;

type MockAuthUsersListener = () => void;
const mockAuthUsersListeners = new Set<MockAuthUsersListener>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function cloneUsers(
  users: readonly MockAuthUserRecord[]
): MockAuthUserRecord[] {
  return users.map((user) => ({ ...user }));
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  return Cookies.get(name) ?? null;
}

function setCookie(name: string, value: string, expiresAt: string): void {
  if (!isBrowser()) return;
  Cookies.set(name, value, {
    path: '/',
    expires: new Date(expiresAt),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  Cookies.remove(name, { path: '/' });
}

function notifyMockAuthUsersListeners(): void {
  for (const listener of mockAuthUsersListeners) {
    listener();
  }
}

function bindCrossTabStorageListener(): void {
  if (!isBrowser() || storageListenerBound) return;
  storageListenerBound = true;
  window.addEventListener('storage', (event) => {
    if (
      event.key !== MOCK_USERS_STORAGE_KEY &&
      event.key !== MOCK_USERS_VERSION_KEY
    ) {
      return;
    }
    memoryUsers = null;
    memoryIndexes = null;
    notifyMockAuthUsersListeners();
  });
}

function syncMemory(users: MockAuthUserRecord[]): MockAuthIndexes {
  memoryUsers = users;
  memoryIndexes = buildMockAuthIndexes(users);
  return memoryIndexes;
}

function persistUsersToStorage(users: MockAuthUserRecord[]): void {
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  window.localStorage.setItem(MOCK_USERS_VERSION_KEY, MOCK_USERS_SEED_VERSION);
}

function readUsersFromStorage(): MockAuthUserRecord[] {
  bindCrossTabStorageListener();

  const version = window.localStorage.getItem(MOCK_USERS_VERSION_KEY);
  if (version !== MOCK_USERS_SEED_VERSION) {
    const seed = cloneUsers(AUTH_MOCK_USERS);
    persistUsersToStorage(seed);
    return seed;
  }

  const stored = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);
  if (!stored) {
    const seed = cloneUsers(AUTH_MOCK_USERS);
    persistUsersToStorage(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as MockAuthUserRecord[];
    return Array.isArray(parsed) ? parsed : cloneUsers(AUTH_MOCK_USERS);
  } catch {
    return cloneUsers(AUTH_MOCK_USERS);
  }
}

/**
 * تنها نویسندهٔ لیست کاربران mock در localStorage.
 * پروفایل/تأییدها باید از همین مسیر patch کنند؛ DB موازی ساخته نشود.
 */
export function writeMockUsers(users: MockAuthUserRecord[]): void {
  if (isBrowser()) {
    assertMockApiMode();
    bindCrossTabStorageListener();
    persistUsersToStorage(users);
  }
  syncMemory(users);
  notifyMockAuthUsersListeners();
}

/**
 * در مرورگر همیشه localStorage منبع حقیقت است تا تب/HMR با حافظهٔ کهنه
 * کاربر تازه‌ثبت‌نام‌شده را از لیست تأیید صلاحیت حذف نکند.
 */
export function readMockUsers(): MockAuthUserRecord[] {
  if (!isBrowser()) {
    if (!memoryUsers) {
      syncMemory(cloneUsers(AUTH_MOCK_USERS));
    }
    return memoryUsers!;
  }

  const users = readUsersFromStorage();
  syncMemory(users);
  return memoryUsers!;
}

/** برای رفرش لیست ادمین وقتی دایرکتوری mock عوض می‌شود (همین تب یا تب دیگر). */
export function subscribeMockAuthUsers(
  listener: MockAuthUsersListener
): () => void {
  mockAuthUsersListeners.add(listener);
  bindCrossTabStorageListener();
  return () => {
    mockAuthUsersListeners.delete(listener);
  };
}

function indexes(): MockAuthIndexes {
  if (!memoryIndexes) {
    syncMemory(readMockUsers());
  }
  return memoryIndexes!;
}

export function findMockUserByMobile(
  mobile: string
): MockAuthUserRecord | undefined {
  readMockUsers();
  return getMockUserByMobile(indexes(), mobile);
}

export function findMockUserById(id: string): MockAuthUserRecord | undefined {
  readMockUsers();
  return getMockUserById(indexes(), id);
}

export function mockMobileExists(mobile: string): boolean {
  return Boolean(findMockUserByMobile(mobile));
}

export type MockAuthUserMatch = {
  id?: string;
  mobile?: string;
};

export function patchMockAuthUser(
  match: MockAuthUserMatch,
  patch: Partial<MockAuthUserRecord>
): MockAuthUserRecord {
  assertMockApiMode();
  const users = readMockUsers();
  const index = users.findIndex(
    (user) =>
      (typeof match.id === 'string' && user.id === match.id) ||
      (typeof match.mobile === 'string' && user.mobile === match.mobile)
  );
  if (index === -1) {
    throw new Error('کاربری برای به‌روزرسانی یافت نشد.');
  }

  const previous = users[index];
  const updated: MockAuthUserRecord = {
    ...previous,
    ...patch,
    password: patch.password ?? previous.password,
    hasPassword: patch.hasPassword ?? previous.hasPassword,
    id: previous.id,
    mobile: patch.mobile ?? previous.mobile,
  };

  const next = [...users];
  next[index] = updated;
  writeMockUsers(next);

  const activeUser = useUserStore.getState().activeUser;
  if (
    activeUser &&
    (activeUser.id === updated.id || activeUser.mobile === updated.mobile)
  ) {
    useUserStore.getState().setUser(toPublicUser(updated));
  }

  return updated;
}

export function resetMockAuthStoreForTests(
  users: MockAuthUserRecord[] = AUTH_MOCK_USERS
): void {
  syncMemory(users);
}

export function toPublicUser(record: MockAuthUserRecord): User {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    mobile: record.mobile,
    role: record.role,
    approved: record.approved,
    docStatus: record.docStatus,
    hasPassword: record.hasPassword,
    adminRequestMessage: record.adminRequestMessage,
    province: record.province,
    city: record.city,
    college: record.college,
    district: record.district,
    school: record.school,
    major: record.major,
    personalCode: record.personalCode,
    studentId: record.studentId,
    skillCode: record.skillCode,
    docUrl: record.docUrl,
    docType: record.docType,
    lastChange: record.lastChange,
  };
}

export function readSessionMeta(): SessionMeta | null {
  if (!isBrowser()) return null;
  const stored = getCookie(SESSION_META_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as SessionMeta;
  } catch {
    return null;
  }
}

export function writeSessionMeta(meta: SessionMeta | null): void {
  if (!isBrowser()) return;
  if (!meta) {
    deleteCookie(SESSION_META_STORAGE_KEY);
    return;
  }
  setCookie(SESSION_META_STORAGE_KEY, JSON.stringify(meta), meta.expiresAt);
}

export function setMockMarkerCookie(expiresAt: string): void {
  if (!isBrowser() || !isMockApiMode()) return;
  Cookies.set(MOCK_SESSION_MARKER, '1', {
    path: '/',
    expires: new Date(expiresAt),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function setRealPresenceCookie(expiresAt: string): void {
  if (!isBrowser() || isMockApiMode()) return;
  Cookies.set(AUTH_COOKIE_NAME, '1', {
    path: '/',
    expires: new Date(expiresAt),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearRealPresenceCookie(): void {
  if (!isBrowser()) return;
  Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
}

export function clearMockMarkerCookie(): void {
  if (!isBrowser()) return;
  Cookies.remove(MOCK_SESSION_MARKER, { path: '/' });
  deleteCookie(SESSION_META_STORAGE_KEY);
}

export function buildMockSession(user: User): Session {
  return {
    user,
    token: `mock.${user.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
  };
}

export function dispatchSessionToStore(
  session: (Session & { refreshToken?: string }) | null
): void {
  useUserStore.getState().setUser(session?.user ?? null);

  writeSessionMeta(
    session
      ? {
          token: session.token,
          expiresAt: session.expiresAt,
          refreshToken: session.refreshToken,
        }
      : null
  );

  if (isMockApiMode()) {
    clearRealPresenceCookie();
    if (session) {
      setMockMarkerCookie(session.expiresAt);
    } else {
      Cookies.remove(MOCK_SESSION_MARKER, { path: '/' });
      deleteCookie(SESSION_META_STORAGE_KEY);
    }
    return;
  }

  Cookies.remove(MOCK_SESSION_MARKER, { path: '/' });
  if (session) {
    setRealPresenceCookie(session.expiresAt);
  } else {
    clearRealPresenceCookie();
    deleteCookie(SESSION_META_STORAGE_KEY);
  }
}
