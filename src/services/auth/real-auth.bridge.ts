import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient, ApiClientError } from '@/services/api-client';
import type { Session, User, UserRole } from '@/types/auth';

/**
 * Nest auth HTTP surface (rule 40 / 45).
 *
 * Contract (cookie session preferred — `apiClient` uses `credentials: 'include'`):
 *
 * ### Public audience (`/auth/login` — Nest must reject `super_admin`)
 * - `POST auth/login`                    `{ mobile, password }` → session + user
 * - `POST auth/otp/login/send`           `{ mobile }` → void
 * - `POST auth/otp/login/verify`         `{ mobile, otp }` → session + user
 * - `POST auth/register`                 `{ mobile }` → void / pending OTP
 * - `POST auth/otp/register/verify`      `{ mobile, otp, role }` → session + user
 * - `POST auth/password/forgot/send`     `{ mobile }` → void (reject super_admin)
 * - `POST auth/password/forgot/verify`   `{ mobile, otp }` → void
 * - `POST auth/password/forgot/reset`    `{ mobile, otp, newPassword }` → void
 * - `POST auth/password/initial`         `{ mobile, newPassword }` → void
 * - `POST auth/logout`                   → void
 * - `GET  auth/session`                  → current session or 401
 *
 * ### Admin audience (`/auth/admin-gate` — Nest must allow only senior admin)
 * - `POST auth/admin/otp/send`           `{ mobile }` → void
 * - `POST auth/admin/otp/verify`         `{ mobile, otp }` → session + user
 *
 * Flip {@link NEST_AUTH_LIVE} when Nest routes exist. Until then every method
 * throws `REAL_MODE_NOT_IMPLEMENTED` after the API-URL guard.
 * UI gates ≠ authorization — Nest must re-validate every mutation.
 */

/** Set true only when Nest auth endpoints are deployed and verified. */
const NEST_AUTH_LIVE = false;

export const REAL_AUTH_PATHS = {
  login: 'auth/login',
  loginOtpSend: 'auth/otp/login/send',
  loginOtpVerify: 'auth/otp/login/verify',
  register: 'auth/register',
  registerOtpVerify: 'auth/otp/register/verify',
  forgotSend: 'auth/password/forgot/send',
  forgotVerify: 'auth/password/forgot/verify',
  forgotReset: 'auth/password/forgot/reset',
  initialPassword: 'auth/password/initial',
  logout: 'auth/logout',
  session: 'auth/session',
  adminOtpSend: 'auth/admin/otp/send',
  adminOtpVerify: 'auth/admin/otp/verify',
} as const;

type NestAuthUserPayload = {
  id: string;
  mobile: string;
  role: User['role'];
  firstName?: string;
  lastName?: string;
  approved?: boolean;
  docStatus?: User['docStatus'];
  hasPassword?: boolean;
};

type NestSessionPayload = {
  user: NestAuthUserPayload;
  expiresAt?: string;
};

function requireApiConfigured(surface: string): void {
  if (!apiClient.isConfigured) {
    throwRealModeNotImplemented(surface);
  }
}

function assertNestLive(surface: string): void {
  if (!NEST_AUTH_LIVE) {
    throwRealModeNotImplemented(surface);
  }
}

function guard(surface: string): void {
  requireApiConfigured(surface);
  assertNestLive(surface);
}

function mapNestUser(payload: NestAuthUserPayload): User {
  return {
    id: payload.id,
    mobile: payload.mobile,
    role: payload.role,
    firstName: payload.firstName ?? '',
    lastName: payload.lastName ?? '',
    approved: payload.approved ?? false,
    docStatus: payload.docStatus ?? 'not_submitted',
    hasPassword: payload.hasPassword ?? false,
  };
}

function extractSessionPayload(raw: unknown): NestSessionPayload {
  if (!raw || typeof raw !== 'object') {
    throw new ApiClientError('پاسخ نشست نامعتبر است.');
  }
  const record = raw as Record<string, unknown>;
  const data =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  const userRaw = data.user;
  if (!userRaw || typeof userRaw !== 'object') {
    throw new ApiClientError('پاسخ نشست فاقد کاربر است.');
  }
  const user = userRaw as NestAuthUserPayload;
  if (typeof user.id !== 'string' || typeof user.mobile !== 'string') {
    throw new ApiClientError('پاسخ نشست ناقص است.');
  }
  return {
    user,
    expiresAt:
      typeof data.expiresAt === 'string' ? data.expiresAt : undefined,
  };
}

/**
 * POST login — Nest sets httpOnly session cookie.
 * Nest must reject `super_admin` on this public path (use admin OTP gate).
 */
export async function realLoginWithCredentials(
  mobile: string,
  password: string
): Promise<User> {
  guard('real-auth.bridge.login');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.login, {
    mobile,
    password,
  });
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realSendLoginOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.loginOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.loginOtpSend, { mobile });
}

export async function realVerifyLoginOtp(
  mobile: string,
  otp: string
): Promise<User> {
  guard('real-auth.bridge.loginOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.loginOtpVerify, {
    mobile,
    otp,
  });
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realRegister(mobile: string): Promise<void> {
  guard('real-auth.bridge.register');
  await apiClient.postJson(REAL_AUTH_PATHS.register, { mobile });
}

export async function realVerifyRegistrationOtp(
  mobile: string,
  otp: string,
  role: UserRole
): Promise<User> {
  guard('real-auth.bridge.registerOtpVerify');
  const raw = await apiClient.postJson<unknown>(
    REAL_AUTH_PATHS.registerOtpVerify,
    { mobile, otp, role }
  );
  return mapNestUser(extractSessionPayload(raw).user);
}

/** Nest must reject `super_admin` — public recovery only. */
export async function realSendForgotPasswordOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.forgotSend');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotSend, { mobile });
}

export async function realVerifyForgotPasswordOtp(
  mobile: string,
  otp: string
): Promise<void> {
  guard('real-auth.bridge.forgotVerify');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotVerify, { mobile, otp });
}

export async function realResetPassword(
  mobile: string,
  otp: string,
  newPassword: string
): Promise<void> {
  guard('real-auth.bridge.forgotReset');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotReset, {
    mobile,
    otp,
    newPassword,
  });
}

export async function realSetInitialPassword(
  mobile: string,
  newPassword: string
): Promise<void> {
  guard('real-auth.bridge.initialPassword');
  await apiClient.postJson(REAL_AUTH_PATHS.initialPassword, {
    mobile,
    newPassword,
  });
}

/** Nest must allow only senior-admin roles. */
export async function realSendAdminGateOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.adminOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.adminOtpSend, { mobile });
}

export async function realVerifyAdminGateOtp(
  mobile: string,
  otp: string
): Promise<User> {
  guard('real-auth.bridge.adminOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.adminOtpVerify, {
    mobile,
    otp,
  });
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realSignOut(): Promise<void> {
  guard('real-auth.bridge.logout');
  await apiClient.postJson(REAL_AUTH_PATHS.logout, {});
}

/**
 * Fetch Nest session (httpOnly cookie). Call from effects only — not render.
 * Returns null on 401; throws on other errors / unwired Nest.
 */
export async function realFetchSession(): Promise<Session | null> {
  guard('real-auth.bridge.session');
  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.session);
    const session = extractSessionPayload(raw);
    return {
      user: mapNestUser(session.user),
      // httpOnly — never mirror Nest session token into JS
      token: '',
      expiresAt:
        session.expiresAt ??
        new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}
