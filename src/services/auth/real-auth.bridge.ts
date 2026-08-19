/**
 * Nest auth transport — called only from AuthService when API_MODE=real.
 * Flip NEST_AUTH_LIVE once Nest routes below are actually serving.
 */
import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient, ApiClientError } from '@/services/api-client';
import {
  extractNestLoginResponse,
  extractNestRefreshTokens,
  looksLikeNestLoginResponse,
  mapNestAuthUser,
  toSessionFromNestLogin,
} from '@/services/auth/nest-auth-mappers';
import {
  nestRoleLabel,
  pickNestRoleDto,
  type NestRoleDto,
} from '@/services/auth/nest-auth-role';
import {
  clearRealAuthTokens,
  readRealAccessToken,
  readRealRefreshToken,
  readRealTokenExpiresAt,
  writeRealAuthTokens,
} from '@/services/auth/real-auth.tokens';
import { dispatchSessionToStore } from '@/services/auth/mock-auth.store';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User, UserRole } from '@/types/auth';

const NEST_AUTH_LIVE = true;

/**
 * Relative paths under NEXT_PUBLIC_API_URL (no leading slash).
 * Source of truth: https://backenddev.darkube.ir/docs — Auth tag.
 * Login/register phone flows use these five routes first.
 */
export const REAL_AUTH_PATHS = {
  login: 'v1/auth/phone/login/password', // POST
  loginOtpSend: 'v1/auth/phone/login/request-otp', // POST
  loginOtpVerify: 'v1/auth/phone/login/verify-otp', // POST
  register: 'v1/auth/phone/register/request-otp', // POST
  registerOtpVerify: 'v1/auth/phone/register/verify-otp', // POST
  forgotSend: 'v1/auth/forgot/password', // POST
  forgotReset: 'v1/auth/reset/password', // POST
  logout: 'v1/auth/logout', // POST
  session: 'v1/auth/me', // GET
  refresh: 'v1/auth/refresh', // POST
  updateMe: 'v1/auth/me', // PATCH
  deleteMe: 'v1/auth/me', // DELETE
  roles: 'v1/auth/roles', // GET
} as const;

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

/** Nest Auth bodies use `phone`; live login validators expect 11-digit `09…`. */
function toPhoneBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  const phone =
    digits.length === 10 && digits.startsWith('9')
      ? `0${digits}`
      : digits;
  return { phone };
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
    if (typeof record.id !== 'string' && typeof record.id !== 'number') {
      continue;
    }
    const label = nestRoleLabel(record);
    if (!label) continue;
    roles.push({
      id: String(record.id),
      name: label as NestRoleDto['name'],
    });
  }

  return pickNestRoleDto(roles, role);
}

function applyNestLoginResponse(raw: unknown): User {
  const parsed = extractNestLoginResponse(raw);
  writeRealAuthTokens(parsed.tokens);
  dispatchSessionToStore({
    user: parsed.user,
    token: parsed.tokens.token,
    expiresAt: parsed.expiresAt,
  });
  return parsed.user;
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
  return applyNestLoginResponse(raw);
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
  return applyNestLoginResponse(raw);
}

export async function realRegister(
  mobile: string,
  role: UserRole
): Promise<void> {
  guard('real-auth.bridge.register');
  const nestRole = await resolveNestRoleDto(role);
  await apiClient.postJson(REAL_AUTH_PATHS.register, {
    ...toPhoneBody(mobile),
    role: { id: nestRole.id, name: nestRole.name, title: nestRole.name },
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
  void _role;
  guard('real-auth.bridge.registerOtpVerify');
  const raw = await apiClient.postMaybeJson<unknown>(
    REAL_AUTH_PATHS.registerOtpVerify,
    { ...toPhoneBody(mobile), otp }
  );

  if (raw && looksLikeNestLoginResponse(raw)) {
    return applyNestLoginResponse(raw);
  }

  throw new ApiClientError(
    'پاسخ تایید ثبت‌نام فاقد نشست/توکن است. از همکار بک‌اند بخواهید LoginResponseDto برگردانند.'
  );
}

export async function realSendForgotPasswordOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.forgotSend');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotSend, toPhoneBody(mobile));
}

export async function realVerifyForgotPasswordOtp(
  mobile: string,
  otp: string
): Promise<void> {
  void mobile;
  void otp;
  guard('real-auth.bridge.forgotVerify');
}

export async function realResetPassword(
  mobile: string,
  otp: string,
  newPassword: string
): Promise<void> {
  guard('real-auth.bridge.forgotReset');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotReset, {
    ...toPhoneBody(mobile),
    otp,
    password: newPassword,
  });
}

export async function realSetInitialPassword(
  mobile: string,
  newPassword: string
): Promise<void> {
  guard('real-auth.bridge.initialPassword');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotReset, {
    ...toPhoneBody(mobile),
    password: newPassword,
  });
}

export async function realSendAdminGateOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.adminOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.loginOtpSend, toPhoneBody(mobile));
}

export async function realVerifyAdminGateOtp(
  mobile: string,
  otp: string
): Promise<User> {
  guard('real-auth.bridge.adminOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.loginOtpVerify, {
    ...toPhoneBody(mobile),
    otp,
  });
  return applyNestLoginResponse(raw);
}

export async function realRefreshToken(
  refreshToken: string
): Promise<Session | null> {
  guard('real-auth.bridge.refresh');
  if (!refreshToken) return null;

  try {
    const raw = await apiClient.postJson<unknown>(
      REAL_AUTH_PATHS.refresh,
      { refreshToken },
      refreshToken
    );

    if (looksLikeNestLoginResponse(raw)) {
      applyNestLoginResponse(raw);
      return toSessionFromNestLogin(raw);
    }

    const tokens = extractNestRefreshTokens(raw);
    writeRealAuthTokens(tokens);
    const existingUser = useUserStore.getState().activeUser;
    const expiresAt = new Date(tokens.tokenExpires).toISOString();

    if (!existingUser) {
      return realFetchSession();
    }

    const session = {
      user: existingUser,
      token: tokens.token,
      expiresAt,
    };
    dispatchSessionToStore(session);
    return session;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      clearRealAuthTokens();
      return null;
    }
    throw error;
  }
}

export async function realUpdateMe(
  body: {
    photo?: { id: string };
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
  },
  token?: string
): Promise<User> {
  guard('real-auth.bridge.updateMe');
  const raw = await apiClient.patchJson<unknown>(
    REAL_AUTH_PATHS.updateMe,
    body,
    token
  );
  return mapNestAuthUser(raw);
}

export async function realDeleteMe(token?: string): Promise<void> {
  guard('real-auth.bridge.deleteMe');
  await apiClient.deleteMaybeJson(REAL_AUTH_PATHS.deleteMe, token);
  clearRealAuthTokens();
}

export async function realSignOut(): Promise<void> {
  guard('real-auth.bridge.logout');
  try {
    await apiClient.postJson(REAL_AUTH_PATHS.logout, {});
  } finally {
    clearRealAuthTokens();
  }
}

export async function realFetchSession(): Promise<Session | null> {
  guard('real-auth.bridge.session');
  let accessToken = readRealAccessToken();
  if (!accessToken) {
    const refreshToken = readRealRefreshToken();
    if (!refreshToken) return null;
    const rotated = await realRefreshToken(refreshToken);
    accessToken = rotated?.token ?? readRealAccessToken();
    if (!accessToken) return null;
  }

  try {
    const raw = await apiClient.getJson<unknown>(
      REAL_AUTH_PATHS.session,
      accessToken
    );
    // GET /auth/me returns User directly (not LoginResponseDto).
    if (looksLikeNestLoginResponse(raw)) {
      return toSessionFromNestLogin(raw);
    }
    const payload =
      raw &&
      typeof raw === 'object' &&
      'data' in raw &&
      (raw as { data: unknown }).data
        ? (raw as { data: unknown }).data
        : raw;
    const user = mapNestAuthUser(payload);
    return {
      user,
      token: accessToken,
      expiresAt:
        readRealTokenExpiresAt() ??
        new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      clearRealAuthTokens();
      return null;
    }
    throw error;
  }
}