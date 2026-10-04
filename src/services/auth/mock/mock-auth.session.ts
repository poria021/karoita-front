import Cookies from 'js-cookie';

import { isMockApiMode } from '@/lib/api-mode';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import { dispatchSessionToStore as dispatchSessionChrome } from '@/services/auth/dispatch-session';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User } from '@/types/auth';

import {
  AUTH_MOCK_USERS,
  type MockAuthUserRecord,
} from '@/services/auth/mock/auth-mock-users';
import {
  buildMockAuthIndexes,
  getMockUserById,
  getMockUserByMobile,
} from '@/services/auth/mock/mock-auth.indexes';

const SESSION_META_STORAGE_KEY = 'karvita_auth_session_meta';

export const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface SessionMeta {
  token: string;
  expiresAt: string;
}

/** داده‌ی ثابت mock — هیچ state یا ذخیره‌سازی‌ای ندارد. */
const mockIndexes = buildMockAuthIndexes(AUTH_MOCK_USERS);

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

export function findMockUserByMobile(
  mobile: string
): MockAuthUserRecord | undefined {
  return getMockUserByMobile(mockIndexes, mobile);
}

export function findMockUserById(id: string): MockAuthUserRecord | undefined {
  return getMockUserById(mockIndexes, id);
}

export function readMockUsers(): readonly MockAuthUserRecord[] {
  return AUTH_MOCK_USERS;
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

  const record = findMockUserById(userId);
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

/**
 * Zustand + ماندگاری mock (cookie / session meta).
 * لایهٔ real فقط `dispatch-session` را صدا می‌زند.
 */
export function dispatchSessionToStore(session: Session | null): void {
  dispatchSessionChrome(session);

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
