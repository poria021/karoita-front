import { authClient } from '@/lib/auth-client';
import { AUTH_COOKIE_NAME } from '@/lib/config';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User, UserRole } from '@/types/auth';

import { AUTH_MOCK_USERS, MOCK_OTP_CODE, MOCK_USER_PASSWORD, type MockAuthUserRecord } from './mock/auth-mock-users';

/**
 * Facade for every authentication interaction in the app (rule 40, #1-#2).
 *
 * UI components and hooks must NEVER import `authClient` or Better-Auth
 * hooks directly — they call `AuthService` instead. This guarantees that
 * swapping the "real" branch below from Better-Auth to the external
 * NestJS API (see MIGRATION_CONTEXT.md) never requires touching a single
 * component.
 */

const IS_MOCK_MODE = process.env.NEXT_PUBLIC_API_MODE !== 'real';

const MOCK_USERS_STORAGE_KEY = 'karvita_mock_auth_users';
const SESSION_META_STORAGE_KEY = 'karvita_auth_session_meta';
const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

/**
 * Placeholder password used only for the interim Better-Auth bridge (see
 * `register`/`verifyRegistrationOtp` "real" branches below), since the
 * legacy prototype's registration flow has no password step of its own.
 * Removed entirely once NestJS registration/OTP endpoints exist.
 */
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

// ==========================================
// توابع کمکی امنیتی برای کار با کوکی مرورگر
// ==========================================
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameLenPlus = name.length + 1;
  return (
    document.cookie
      .split(';')
      .map((c) => c.trim())
      .filter((cookie) => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map((cookie) => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null
  );
}

function setCookie(name: string, value: string, expiresAt: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; expires=${new Date(expiresAt).toUTCString()}; samesite=strict; secure`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
// ==========================================

function readMockUsers(): MockAuthUserRecord[] {
  if (!isBrowser()) return AUTH_MOCK_USERS;

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

function writeMockUsers(users: MockAuthUserRecord[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
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

// اصلاح این تابع برای خواندن توکن از کوکی
function readSessionMeta(): SessionMeta | null {
  if (!isBrowser()) return null;
  const stored = getCookie(SESSION_META_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as SessionMeta;
  } catch {
    return null;
  }
}

// اصلاح این تابع برای نوشتن توکن در کوکی
function writeSessionMeta(meta: SessionMeta | null): void {
  if (!isBrowser()) return;
  if (!meta) {
    deleteCookie(SESSION_META_STORAGE_KEY);
    return;
  }
  setCookie(SESSION_META_STORAGE_KEY, JSON.stringify(meta), meta.expiresAt);
}

/**
 * Lightweight, non-secret marker cookie so a future `src/middleware.ts`
 * can cheaply check "is someone logged in" at the Edge (rule 40, #3).
 * Only used in mock mode — in real mode Better-Auth's `nextCookies()`
 * plugin already issues its own HTTP-only session cookie server-side.
 */
function setMarkerCookie(expiresAt: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; expires=${new Date(expiresAt).toUTCString()}; samesite=lax`;
}

function clearMarkerCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function dispatchSessionToStore(session: Session | null): void {
  useUserStore.getState().setUser(session?.user ?? null);
  writeSessionMeta(session ? { token: session.token, expiresAt: session.expiresAt } : null);
  if (session) {
    setMarkerCookie(session.expiresAt);
  } else {
    clearMarkerCookie();
  }
}

function buildMockSession(user: User): Session {
  return {
    user,
    token: `mock.${user.id}.${Date.now()}`,
    expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
  };
}

/** Best-effort bridge until the real Better-Auth `user` schema stores mobile numbers. */
function toPseudoEmail(mobile: string): string {
  return `${mobile}@karvita.local`;
}

function mapBetterAuthRole(rawRole: string | null | undefined): UserRole {
  return rawRole === 'admin' ? 'super_admin' : 'student';
}

export class AuthService {
  /** Password + credential login. */
  static async loginWithCredentials(mobile: string, password: string): Promise<User> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record || record.password !== password) {
        throw new Error('شماره موبایل یا رمز عبور اشتباه است.');
      }

      const user = toPublicUser(record);
      dispatchSessionToStore(buildMockSession(user));
      return user;
    }

    // TODO(NestJS migration): replace with a direct call to the external API.
    const { data, error } = await authClient.signIn.email({
      email: toPseudoEmail(mobile),
      password,
    });

    if (error || !data) {
      throw new Error(error?.message || 'ورود ناموفق بود.');
    }

    const [firstName, ...lastNameParts] = data.user.name.split(' ');
    const user: User = {
      id: data.user.id,
      firstName: firstName || 'کاربر',
      lastName: lastNameParts.join(' ') || 'کارویتا',
      mobile,
      role: mapBetterAuthRole(data.user.role),
      approved: true,
      docStatus: 'approved',
    };

    dispatchSessionToStore({
      user,
      token: data.token ?? '',
      expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
    });
    return user;
  }

  /** Step 1 of OTP login: dispatch (or simulate) the SMS code. */
  static async sendLoginOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      return;
    }

    // TODO(NestJS migration): trigger the real SMS/OTP provider through the API.
    throw new Error('ورود با کد یکبار مصرف در حالت واقعی هنوز پیاده‌سازی نشده است.');
  }

  /** Step 2 of OTP login: verify the code (test code `12345` in mock mode) and sign in. */
  static async verifyLoginOtp(mobile: string, otp: string): Promise<User> {
    if (IS_MOCK_MODE) {
      if (otp !== MOCK_OTP_CODE) {
        throw new Error('کد تایید نادرست است (کد تست: ۱۲۳۴۵).');
      }

      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }

      const user = toPublicUser(record);
      dispatchSessionToStore(buildMockSession(user));
      return user;
    }

    throw new Error('ورود با کد یکبار مصرف در حالت واقعی هنوز پیاده‌سازی نشده است.');
  }

  /** Step 1 of registration: reserve the mobile number and dispatch/simulate the OTP. */
  static async register(payload: RegisterPayload): Promise<void> {
    if (IS_MOCK_MODE) {
      const alreadyExists = readMockUsers().some((candidate) => candidate.mobile === payload.mobile);
      if (alreadyExists) {
        throw new Error('کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.');
      }
      return;
    }

    // TODO(NestJS migration): replace with a direct call to the external API.
    const { error } = await authClient.signUp.email({
      email: toPseudoEmail(payload.mobile),
      password: INTERIM_BRIDGE_PASSWORD,
      name: 'کاربر جدید',
    });

    if (error) {
      throw new Error(error.message || 'ثبت‌نام ناموفق بود.');
    }
  }

  /** Step 2 of registration: verify the OTP (test code `12345`) and create the account. */
  static async verifyRegistrationOtp(mobile: string, otp: string, role: UserRole): Promise<User> {
    if (otp !== MOCK_OTP_CODE) {
      throw new Error('کد تایید نادرست است (کد تست: ۱۲۳۴۵).');
    }

    if (IS_MOCK_MODE) {
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

    const { data, error } = await authClient.signIn.email({
      email: toPseudoEmail(mobile),
      password: INTERIM_BRIDGE_PASSWORD,
    });

    if (error || !data) {
      throw new Error(error?.message || 'تایید ثبت‌نام ناموفق بود.');
    }

    const user: User = {
      id: data.user.id,
      firstName: '',
      lastName: '',
      mobile,
      role,
      approved: false,
      docStatus: 'not_submitted',
    };

    dispatchSessionToStore({
      user,
      token: data.token ?? '',
      expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
    });
    return user;
  }

  /** Step 1 of password recovery: verify the mobile is registered and dispatch/simulate the OTP. */
  static async sendForgotPasswordOtp(mobile: string): Promise<void> {
    if (IS_MOCK_MODE) {
      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      return;
    }

    // TODO(NestJS migration): trigger the real SMS/OTP provider through the API.
    throw new Error('بازیابی رمز عبور در حالت واقعی هنوز پیاده‌سازی نشده است.');
  }

  /** Step 2 of password recovery: verify the code (test code `12345` in mock mode) without signing in. */
  static async verifyForgotPasswordOtp(mobile: string, otp: string): Promise<void> {
    if (IS_MOCK_MODE) {
      if (otp !== MOCK_OTP_CODE) {
        throw new Error('کد تایید نادرست است (کد تست: ۱۲۳۴۵).');
      }

      const record = readMockUsers().find((candidate) => candidate.mobile === mobile);
      if (!record) {
        throw new Error('کاربری با این شماره یافت نشد.');
      }
      return;
    }

    throw new Error('بازیابی رمز عبور در حالت واقعی هنوز پیاده‌سازی نشده است.');
  }

  /** Step 3 of password recovery: re-verify the OTP and persist the new password. */
  static async resetPassword(mobile: string, otp: string, newPassword: string): Promise<void> {
    if (IS_MOCK_MODE) {
      if (otp !== MOCK_OTP_CODE) {
        throw new Error('کد تایید نادرست است (کد تست: ۱۲۳۴۵).');
      }

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

    // TODO(NestJS migration): replace with a direct call to the external API's reset-password endpoint.
    throw new Error('بازیابی رمز عبور در حالت واقعی هنوز پیاده‌سازی نشده است.');
  }

  /**
   * First-time password registration for accounts created via OTP-only signup
   * (profile security tab — mirrors `saveFirstTimePassword` in the legacy HTML).
   */
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

    throw new Error('ثبت رمز عبور اولیه در حالت واقعی هنوز پیاده‌سازی نشده است.');
  }

  /** Clears the active session everywhere: `useUserStore`, marker cookie, and Better-Auth (real mode). */
  static async logout(): Promise<void> {
    if (!IS_MOCK_MODE) {
      // TODO(NestJS migration): call the external API's logout endpoint instead.
      await authClient.signOut();
    }

    dispatchSessionToStore(null);
  }

  /** Synchronous read of the currently active session, if any. */
  static getSession(): Session | null {
    const activeUser = useUserStore.getState().activeUser;
    const meta = readSessionMeta();
    if (!activeUser || !meta) return null;

    return { user: activeUser, token: meta.token, expiresAt: meta.expiresAt };
  }
}