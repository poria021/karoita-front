import Cookies from 'js-cookie';

import { assertMockApiMode, isMockApiMode } from '@/lib/api-mode';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User } from '@/types/auth';

import {
  AUTH_MOCK_USERS,
  MOCK_USERS_SEED_VERSION,
  type MockAuthUserRecord,
} from '@/services/mock/auth-mock-users';
import {
  buildMockAuthIndexes,
  getMockUserById,
  getMockUserByMobile,
  type MockAuthIndexes,
} from '@/services/auth/mock-auth.indexes';

const MOCK_USERS_STORAGE_KEY = 'karvita_mock_auth_users';
const MOCK_USERS_VERSION_KEY = 'karvita_mock_auth_users_version';
/** Mock-only: JSON `{ token, expiresAt }` — never used in real mode. */
const SESSION_META_STORAGE_KEY = 'karvita_auth_session_meta';

export const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface SessionMeta {
  token: string;
  expiresAt: string;
}

let memoryUsers: MockAuthUserRecord[] | null = null;
let memoryIndexes: MockAuthIndexes | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
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

function syncMemory(users: MockAuthUserRecord[]): MockAuthIndexes {
  memoryUsers = users;
  memoryIndexes = buildMockAuthIndexes(users);
  return memoryIndexes;
}

function readUsersFromStorage(): MockAuthUserRecord[] {
  if (!isBrowser()) {
    return memoryUsers ?? AUTH_MOCK_USERS;
  }

  const version = window.localStorage.getItem(MOCK_USERS_VERSION_KEY);
  if (version !== MOCK_USERS_SEED_VERSION) {
    writeMockUsers(AUTH_MOCK_USERS);
    return AUTH_MOCK_USERS;
  }

  const stored = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);
  if (!stored) {
    writeMockUsers(AUTH_MOCK_USERS);
    return AUTH_MOCK_USERS;
  }

  try {
    const parsed = JSON.parse(stored) as MockAuthUserRecord[];
    return Array.isArray(parsed) ? parsed : AUTH_MOCK_USERS;
  } catch {
    return AUTH_MOCK_USERS;
  }
}

/** Persist users + rebuild mobile/id indexes. */
export function writeMockUsers(users: MockAuthUserRecord[]): void {
  if (isBrowser()) {
    assertMockApiMode();
    window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
    window.localStorage.setItem(MOCK_USERS_VERSION_KEY, MOCK_USERS_SEED_VERSION);
  }
  syncMemory(users);
}

export function readMockUsers(): MockAuthUserRecord[] {
  if (memoryUsers) return memoryUsers;
  const users = readUsersFromStorage();
  syncMemory(users);
  return users;
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

/** Test helper — resets in-memory cache (and optional users). */
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
    personalCode: record.personalCode,
    studentId: record.studentId,
    skillCode: record.skillCode,
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

export function buildMockSession(user: User): Session {
  return {
    user,
    token: `mock.${user.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
  };
}

export function dispatchSessionToStore(session: Session | null): void {
  useUserStore.getState().setUser(session?.user ?? null);

  if (!isMockApiMode()) {
    clearMockMarkerCookie();
    return;
  }

  writeSessionMeta(
    session ? { token: session.token, expiresAt: session.expiresAt } : null
  );
  if (session) {
    setMockMarkerCookie(session.expiresAt);
  } else {
    clearMockMarkerCookie();
  }
}
