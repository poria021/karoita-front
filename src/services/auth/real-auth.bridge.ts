/**
 * Nest auth transport — called only from AuthService when API_MODE=real.
 * Flip NEST_AUTH_LIVE once Nest routes below are actually serving.
 */
import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient, ApiClientError } from '@/services/api-client';
import {
  pickNestRoleDto,
  type NestRoleDto,
} from '@/services/auth/nest-auth-role';
import type { Session, User, UserRole } from '@/types/auth';

const NEST_AUTH_LIVE = true;

/**
 * Relative paths under NEXT_PUBLIC_API_URL (no leading slash).
 * Source of truth: https://backenddev.darkube.ir/docs — Auth tag.
 * Login/register phone flows use these five routes first.
 */
export const REAL_AUTH_PATHS = {
  login: 'api/v1/auth/phone/login/password', // POST
  loginOtpSend: 'api/v1/auth/phone/login/request-otp', // POST
  loginOtpVerify: 'api/v1/auth/phone/login/verify-otp', // POST
  register: 'api/v1/auth/phone/register/request-otp', // POST
  registerOtpVerify: 'api/v1/auth/phone/register/verify-otp', // POST
  forgotSend: 'api/v1/auth/forgot/password', // POST
  forgotReset: 'api/v1/auth/reset/password', // POST
  logout: 'api/v1/auth/logout', // POST
  session: 'api/v1/auth/me', // GET
  refresh: 'api/v1/auth/refresh', // POST
  updateMe: 'api/v1/auth/me', // PATCH
  deleteMe: 'api/v1/auth/me', // DELETE
  roles: 'api/v1/auth/roles', // GET
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

/** Nest Auth bodies use `phone`; Facade / UI keep `mobile` in domain types. */
function toPhoneBody(mobile: string): { phone: string } {
  return { phone: mobile };
}

async function resolveNestRoleDto(role: UserRole): Promise<NestRoleDto> {
  const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.roles);
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { data?: unknown }).data)
      ? (raw as { data: unknown[] }).data
      : null;

  if (!list) {
    throw new ApiClientError('پاسخ لیست نقش‌ها نامعتبر است.');
  }

  const roles: NestRoleDto[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.name !== 'string') {
      continue;
    }
    roles.push({ id: record.id, name: record.name as NestRoleDto['name'] });
  }

  return pickNestRoleDto(roles, role);
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

export async function realLoginWithCredentials(
  mobile: string,
  password: string
): Promise<User> {
  guard('real-auth.bridge.login');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.login, {
    ...toPhoneBody(mobile),
    password,
  });
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realSendLoginOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.loginOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.loginOtpSend, toPhoneBody(mobile));
}

export async function realVerifyLoginOtp(
  mobile: string,
  otp: string
): Promise<User> {
  guard('real-auth.bridge.loginOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.loginOtpVerify, {
    ...toPhoneBody(mobile),
    otp,
  });
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realRegister(
  mobile: string,
  role: UserRole
): Promise<void> {
  guard('real-auth.bridge.register');
  const nestRole = await resolveNestRoleDto(role);
  await apiClient.postJson(REAL_AUTH_PATHS.register, {
    ...toPhoneBody(mobile),
    role: nestRole,
  });
}

/**
 * Nest AuthConfirmPhoneDto is only `{ phone, otp }` (role was sent on request-otp).
 * `role` stays on the Facade signature for mock + post-verify UX.
 */
export async function realVerifyRegistrationOtp(
  mobile: string,
  otp: string,
  _role: UserRole
): Promise<User> {
  guard('real-auth.bridge.registerOtpVerify');
  const raw = await apiClient.postJson<unknown>(
    REAL_AUTH_PATHS.registerOtpVerify,
    { ...toPhoneBody(mobile), otp }
  );
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realSendForgotPasswordOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.forgotSend');
  // Nest AuthForgotPasswordDto currently uses `email` — wire separately from phone auth.
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

export async function realFetchSession(): Promise<Session | null> {
  guard('real-auth.bridge.session');
  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.session);
    const session = extractSessionPayload(raw);
    return {
      user: mapNestUser(session.user),
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
