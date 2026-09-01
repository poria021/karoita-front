import Cookies from 'js-cookie';

import { assertMockApiMode, isMockApiMode } from '@/lib/api-mode';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import { setRuntimeAuthBoot } from '@/store/sessionBoot';
import { keepLocalIdentityPreview } from '@/services/auth/keep-local-identity-preview';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User } from '@/types/auth';

import {
  AUTH_MOCK_USERS,
  MOCK_USERS_SEED_VERSION,
  type MockAuthUserRecord,
} from '@/services/auth/mock/auth-mock-users';
import {
  buildMockAuthIndexes,
  getMockUserById,
  getMockUserByMobile,
  type MockAuthIndexes,
} from '@/services/auth/mock/mock-auth.indexes';

export const MOCK_USERS_STORAGE_KEY = 'karvita_mock_auth_users';
const MOCK_USERS_VERSION_KEY = 'karvita_mock_auth_users_version';
const SESSION_META_STORAGE_KEY = 'karvita_auth_session_meta';
/** پیشوند کلیدهای جداگانه docUrl (base64 می‌تواند چند صد KB باشد) */
const MOCK_DOC_URL_PREFIX = 'karvita_mock_doc_url_';

export const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface SessionMeta {
  token: string;
  expiresAt: string;
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

export function readMockDocUrl(userId: string): string | undefined {
  if (!isBrowser()) return undefined;
  return window.localStorage.getItem(MOCK_DOC_URL_PREFIX + userId) ?? undefined;
}

export function writeMockDocUrl(userId: string, docUrl: string | undefined): void {
  if (!isBrowser()) return;
  if (docUrl) {
    try {
      window.localStorage.setItem(MOCK_DOC_URL_PREFIX + userId, docUrl);
    } catch {
      // سهمیهٔ localStorage پر است — مدرک را drop کن نه کل persist
    }
  } else {
    window.localStorage.removeItem(MOCK_DOC_URL_PREFIX + userId);
  }
}

function persistUsersToStorage(users: MockAuthUserRecord[]): void {
  const slim = users.map(({ docUrl, ...rest }) => {
    if (docUrl !== undefined) {
      writeMockDocUrl(rest.id, docUrl);
    }
    return rest;
  });
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(slim));
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
    if (!Array.isArray(parsed)) return cloneUsers(AUTH_MOCK_USERS);
    return parsed.map((u) => ({
      ...u,
      docUrl: readMockDocUrl(u.id) ?? u.docUrl,
    }));
  } catch {
    return cloneUsers(AUTH_MOCK_USERS);
  }
}

export function writeMockUsers(users: MockAuthUserRecord[]): void {
  if (isBrowser()) {
    assertMockApiMode();
    bindCrossTabStorageListener();
    persistUsersToStorage(users);
  }
  syncMemory(users);
  notifyMockAuthUsersListeners();
}

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

  if (isBrowser() && 'docUrl' in patch) {
    writeMockDocUrl(updated.id, patch.docUrl);
  }

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
  const docUrl = isBrowser()
    ? (readMockDocUrl(record.id) ?? record.docUrl)
    : record.docUrl;
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
    docUrl,
    docType: record.docType,
    lastChange: record.lastChange,
  };
}

export function readSessionMeta(): SessionMeta | null {
  if (!isBrowser() || !isMockApiMode()) return null;
  const stored = getCookie(SESSION_META_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as SessionMeta;
  } catch {
    return null;
  }
}

export function writeSessionMeta(meta: SessionMeta | null): void {
  if (!isBrowser() || !isMockApiMode()) return;
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

export function clearMockMarkerCookie(): void {
  if (!isBrowser()) return;
  Cookies.remove(MOCK_SESSION_MARKER, { path: '/' });
  deleteCookie(SESSION_META_STORAGE_KEY);
}

export function tryRestoreMockSession(): Session | null {
  if (!isBrowser() || !isMockApiMode()) return null;
  const meta = readSessionMeta();
  if (!meta) return null;
  if (new Date(meta.expiresAt).getTime() <= Date.now()) return null;

  const parts = meta.token.split('.');
  const userId = parts[1];
  if (!userId) return null;

  const record = getMockUserById(indexes(), userId);
  if (!record) return null;

  const user = toPublicUser(record);
  useUserStore.getState().setUser(user);
  return { user, token: meta.token, expiresAt: meta.expiresAt };
}

/** شکل `mock.{userId}.{issuedAt}` — `tryRestoreMockSession` قسمت `userId` را می‌خواند. */
export function buildMockSessionToken(userId: string): string {
  return `mock.${userId}.${Date.now()}`;
}

export function buildMockSession(user: User): Session {
  return {
    user,
    token: buildMockSessionToken(user.id),
    expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
  };
}

export function dispatchSessionToStore(session: Session | null): void {
  const store = useUserStore.getState();
  if (!session) {
    store.setUser(null);
  } else {
    store.setUser(keepLocalIdentityPreview(store.activeUser, session.user));
  }

  if (session) {
    store.setHasHydrated(true);
    setRuntimeAuthBoot('authenticated');
  } else {
    setRuntimeAuthBoot('unauthenticated');
  }

  if (!isMockApiMode()) return;

  writeSessionMeta(
    session ? { token: session.token, expiresAt: session.expiresAt } : null
  );
  if (session) {
    setMockMarkerCookie(session.expiresAt);
  } else {
    clearMockMarkerCookie();
  }
}
