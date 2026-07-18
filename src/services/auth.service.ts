import Cookies from 'js-cookie';

import {
  assertMockApiMode,
  assertRealModeRejectsMockSecret,
  isMockApiMode,
  REAL_MODE_NOT_IMPLEMENTED,
} from '@/lib/api-mode';
import { authClient } from '@/lib/auth-client';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User, UserRole } from '@/types/auth';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import {
  AUTH_MOCK_USERS,
  MOCK_OTP_CODE,
  MOCK_USER_PASSWORD,
  MOCK_USERS_SEED_VERSION,
  type MockAuthUserRecord,
} from './mock/auth-mock-users';

/**
 * Facade for every authentication interaction (rule 40).
 * Mock session meta stays JS-readable for local DX only — NOT Nest auth.
 * Real mode relies on Better-Auth / Nest httpOnly cookies — no token in JS cookies.
 */

const IS_MOCK_MODE = isMockApiMode();

const MOCK_USERS_STORAGE_KEY = 'karvita_mock_auth_users';
const MOCK_USERS_VERSION_KEY = 'karvita_mock_auth_users_version';
/** Mock-only: JSON `{ token, expiresAt }` — never used in real mode. */
const SESSION_META_STORAGE_KEY = 'karvita_auth_session_meta';
const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const INTERIM_BRIDGE_PASSWORD = 'karvita-otp-bridge-placeholder';

export interface RegisterPayload {
  mobile: string;
  role: UserRole;
}

interface SessionMeta {
  token: string;
  expiresAt: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  return Cookies.get(name) ?? null;
}

function setCookie(name: string, value: string, expiresAt: string): void {
  if (!isBrowser()) return;
  // Session meta is JS-readable (mock DX only). Prefer Strict + Secure in prod.
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

function readMockUsers(): MockAuthUserRecord[] {
  if (!isBrowser()) return AUTH_MOCK_USERS;

  const version = window.localStorage.getItem(MOCK_USERS_VERSION_KEY);
  if (version !== MOCK_USERS_SEED_VERSION) {
    writeMockUsers(AUTH_MOCK_USERS);
    window.localStorage.setItem(MOCK_USERS_VERSION_KEY, MOCK_USERS_SEED_VERSION);
    return AUTH_MOCK_USERS;
  }

  const stored = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);
  if (!stored) {
    writeMockUsers(AUTH_MOCK_USERS);
    window.localStorage.setItem(MOCK_USERS_VERSION_KEY, MOCK_USERS_SEED_VERSION);
    return AUTH_MOCK_USERS;
  }

  try {
    const parsed = JSON.parse(stored) as MockAuthUserRecord[];
    return Array.isArray(parsed) ? parsed : AUTH_MOCK_USERS;
  } catch {
    return AUTH_MOCK_USERS;
  }
}

function writeMockUsers(users: MockAuthUserRecord[]): void {
  if (!isBrowser()) return;
  assertMockApiMode();
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  window.localStorage.setItem(MOCK_USERS_VERSION_KEY, MOCK_USERS_SEED_VERSION);
}

function toPublicUser(record: MockAuthUserRecord): User {
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

function readSessionMeta(): SessionMeta | null {
  if (!isBrowser() || !IS_MOCK_MODE) return null;
  const stored = getCookie(SESSION_META_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as SessionMeta;
  } catch {
    return null;
  }
}

function writeSessionMeta(meta: SessionMeta | null): void {
  if (!isBrowser() || !IS_MOCK_MODE) return;
  if (!meta) {
    deleteCookie(SESSION_META_STORAGE_KEY);
    return;
  }
  setCookie(SESSION_META_STORAGE_KEY, JSON.stringify(meta), meta.expiresAt);
}

function setMockMarkerCookie(expiresAt: string): void {
  if (!isBrowser() || !IS_MOCK_MODE) return;
  // Presence-only for Edge — NOT a secret / NOT a role claim (rule 45).
  // Lax so navigations from external OTP links still carry the marker.
  Cookies.set(MOCK_SESSION_MARKER, '1', {
    path: '/',
    expires: new Date(expiresAt),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function clearMockMarkerCookie(): void {
  if (!isBrowser()) return;
  Cookies.remove(MOCK_SESSION_MARKER, { path: '/' });
  deleteCookie(SESSION_META_STORAGE_KEY);
}

function dispatchSessionToStore(session: Session | null): void {
  useUserStore.getState().setUser(session?.user ?? null);

  if (!IS_MOCK_MODE) {
    // Real: never persist bearer tokens in JS-readable cookies.
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

function buildMockSession(user: User): Session {
  return {
    user,
    token: `mock.${user.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
  };
}

function toPseudoEmail(mobile: string): string {
  return `${mobile}@karvita.local`;
}

function mapBetterAuthRole(rawRole: string | null | undefined): UserRole {
  return rawRole === 'admin' ? 'super_admin' : 'student';
}

/** Accepts {@link MOCK_OTP_CODE} only inside mock simulator — never in real. */
function assertMockOtp(otp: string): void {
  assertMockApiMode();
  if (otp !== MOCK_OTP_CODE) {
    throw new Error(
      'کد تایید نادرست است. (شبیه‌ساز محلی mock — این کد OTP سرور Nest نیست.)'
    );
  }
}

/** Real OTP branches: refuse fixed mock secret before Nest / not-implemented. */
function rejectMockOtpInReal(otp: string): void {
  assertRealModeRejectsMockSecret(otp, MOCK_OTP_CODE, 'OTP');
}

export class AuthService {
  static async loginWithCredentials(mobile: string, password: string): Promise<User> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      if (record.password !== password) {
        throw new Error('شماره موبایل یا رمز عبور اشتباه است.');
      }

      const user = toPublicUser(record);
      dispatchSessionToStore(buildMockSession(user));
      return user;
    }

    const { data, error } = await authClient.signIn.email({
      email: toPseudoEmail(mobile),
      password,
    });

    if (error || !data?.user) {
      throw new Error(error?.message || 'ورود ناموفق بود.');
    }

    const user: User = {
      id: data.user.id,
      firstName: data.user.name?.split(' ')[0] ?? '',
      lastName: data.user.name?.split(' ').slice(1).join(' ') ?? '',
      mobile,
      role: mapBetterAuthRole(
        (data.user as { role?: string | null }).role
      ),
      approved: false,
      docStatus: 'not_submitted',
    };

    dispatchSessionToStore({
      user,
      token: '',
      expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
    });
    return user;
  }

  static async sendLoginOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      return;
    }

    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async verifyLoginOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      assertMockOtp(otp);

      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }

      const user = toPublicUser(record);
      dispatchSessionToStore(buildMockSession(user));
      return user;
    }

    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  /**
   * Admin gate — only `super_admin`. OTP-only entry (original-karvita.html).
   */
  static async sendAdminGateOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record || !isSuperAdminRole(record.role)) {
        throw new Error('دسترسی این درگاه فقط برای مدیریت ارشد سامانه است.');
      }
      return;
    }

    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async verifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      assertMockOtp(otp);

      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record || !isSuperAdminRole(record.role)) {
        throw new Error('دسترسی این درگاه فقط برای مدیریت ارشد سامانه است.');
      }

      const user = toPublicUser(record);
      dispatchSessionToStore(buildMockSession(user));
      return user;
    }

    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async register(payload: RegisterPayload): Promise<void> {
    if (IS_MOCK_MODE) {
      const alreadyExists = readMockUsers().some(
        (candidate) => candidate.mobile === payload.mobile
      );
      if (alreadyExists) {
        throw new Error('کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.');
      }
      return;
    }

    const { error } = await authClient.signUp.email({
      email: toPseudoEmail(payload.mobile),
      password: INTERIM_BRIDGE_PASSWORD,
      name: 'کاربر جدید',
    });

    if (error) {
      throw new Error(error.message || 'ثبت‌نام ناموفق بود.');
    }
  }

  static async verifyRegistrationOtp(
    mobile: string,
    otp: string,
    role: UserRole
  ): Promise<User> {
    if (IS_MOCK_MODE) {
      assertMockOtp(otp);

      const users = readMockUsers();
      const newRecord: MockAuthUserRecord = {
        id: `#U-${Date.now()}`,
        firstName: '',
        lastName: '',
        mobile,
        role,
        approved: false,
        docStatus: 'not_submitted',
        password: MOCK_USER_PASSWORD,
        hasPassword: false,
      };

      writeMockUsers([...users, newRecord]);

      const user = toPublicUser(newRecord);
      dispatchSessionToStore(buildMockSession(user));
      return user;
    }

    // Real: OTP must come from Nest later — never accept MOCK_OTP_CODE here.
    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async sendForgotPasswordOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      return;
    }

    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async verifyForgotPasswordOtp(mobile: string, otp: string): Promise<void> {
    if (IS_MOCK_MODE) {
      assertMockOtp(otp);

      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      return;
    }

    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async resetPassword(
    mobile: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    if (IS_MOCK_MODE) {
      assertMockOtp(otp);

      const users = readMockUsers();
      const recordIndex = users.findIndex((candidate) => candidate.mobile === mobile);
      if (recordIndex === -1) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }

      const updatedUsers = [...users];
      updatedUsers[recordIndex] = {
        ...updatedUsers[recordIndex],
        password: newPassword,
        hasPassword: true,
      };
      writeMockUsers(updatedUsers);

      const activeUser = useUserStore.getState().activeUser;
      if (activeUser?.mobile === mobile) {
        useUserStore.getState().setUser({ ...activeUser, hasPassword: true });
      }
      return;
    }

    rejectMockOtpInReal(otp);
    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async setInitialPassword(mobile: string, newPassword: string): Promise<void> {
    if (newPassword.trim().length < 8) {
      throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }

    if (IS_MOCK_MODE) {
      const users = readMockUsers();
      const recordIndex = users.findIndex((candidate) => candidate.mobile === mobile);
      if (recordIndex === -1) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }

      const updatedUsers = [...users];
      updatedUsers[recordIndex] = {
        ...updatedUsers[recordIndex],
        password: newPassword,
        hasPassword: true,
      };
      writeMockUsers(updatedUsers);

      const activeUser = useUserStore.getState().activeUser;
      if (activeUser?.mobile === mobile) {
        useUserStore.getState().setUser({ ...activeUser, hasPassword: true });
      }
      return;
    }

    throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  }

  static async logout(): Promise<void> {
    if (!IS_MOCK_MODE) {
      try {
        await authClient.signOut();
      } catch {
        // Still clear local state below.
      }
    }

    dispatchSessionToStore(null);
  }

  /**
   * Idempotent session read for render — never clears cookies/store.
   * Prefer this (or {@link getSession}) inside React render paths.
   */
  static peekSession(): Session | null {
    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) return null;

    if (IS_MOCK_MODE) {
      const meta = readSessionMeta();
      if (!meta) return null;
      if (new Date(meta.expiresAt).getTime() <= Date.now()) return null;
      return { user: activeUser, token: meta.token, expiresAt: meta.expiresAt };
    }

    // Real: bearer stays httpOnly; Zustand user is UX chrome only (rule 45).
    return {
      user: activeUser,
      token: '',
      expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
    };
  }

  /**
   * Validate session and clear expired/missing mock meta. Call only from
   * effects / event handlers — never during render (rule 45).
   */
  static validateSession(): Session | null {
    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) return null;

    if (IS_MOCK_MODE) {
      const meta = readSessionMeta();
      if (!meta || new Date(meta.expiresAt).getTime() <= Date.now()) {
        dispatchSessionToStore(null);
        return null;
      }
      return { user: activeUser, token: meta.token, expiresAt: meta.expiresAt };
    }

    return AuthService.peekSession();
  }

  /**
   * Render-safe alias of {@link peekSession}. Does not mutate session state.
   * Use {@link validateSession} in effects to clear expired mock sessions.
   */
  static getSession(): Session | null {
    return AuthService.peekSession();
  }
}
