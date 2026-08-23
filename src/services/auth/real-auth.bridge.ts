/**
 * Nest auth transport — AuthService when API_MODE=real.
 * Phone login/register/OTP/session/refresh/logout/me match backenddev OpenAPI.
 * Forgot: Nest has no verify-otp route; OTP is the reset `hash`.
 * Set-initial-password: PATCH /auth/me { password } while logged in.
 *
 * Admin gate از اندپوینت‌های جداگانه‌ی خود استفاده می‌کند:
 *   POST api/v1/admin/auth/phone/login/request-otp  { phone: '9XXXXXXXXX' }
 *   POST api/v1/admin/auth/phone/login/verify-otp   { phone: '09XXXXXXXXX', otp }
 * پاسخ verify: AdminLoginResponseDto { token, refreshToken, tokenExpires, admin: {...} }
 */
import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient, ApiClientError } from '@/services/api-client';
import {
  extractNestAdminLoginResponse,
  extractNestLoginResponse,
  extractNestRefreshTokens,
  looksLikeNestAdminLoginResponse,
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
 * آیدی‌های پیش‌فرض نقش‌ها جهت جلوگیری از بن‌بست در صورت خطای ۵۰۰ اندپوینت roles
 */
const FALLBACK_ROLE_IDS: Record<string, string> = {
  student: '6a43982fceda93d39f5d3493',
  skill_learner: '6a43982fceda93d39f5d3494',
  supervisor_professor: '6a43982fceda93d39f5d3495',
  mentor_teacher: '6a43982fceda93d39f5d3496',
  school_principal: '6a43982fceda93d39f5d3497',
};

/**
 * Relative paths under NEXT_PUBLIC_API_URL (no leading slash).
 * Source of truth: https://backenddev.darkube.ir/docs — Auth tag.
 *
 * ─── Phone Login ──────────────────────────────────────────────────────────────
 * POST v1/auth/phone/login/password         { phone, password }  → LoginResponseDto
 * POST v1/auth/phone/login/request-otp      { phone }            → void
 * POST v1/auth/phone/login/verify-otp       { phone, otp }       → LoginResponseDto
 *
 * ─── Phone Register ───────────────────────────────────────────────────────────
 * POST v1/auth/phone/register/request-otp   { phone, role }      → void
 * POST v1/auth/phone/register/verify-otp    { phone, otp }       → LoginResponseDto
 * GET  v1/auth/roles                                             → RoleDto[]
 *
 * ─── Forgot / Reset Password ──────────────────────────────────────────────────
 * POST v1/auth/forgot/password              { phone }            → void
 * POST v1/auth/reset/password               { phone, otp, password, hash } → void
 *
 * ─── Session ──────────────────────────────────────────────────────────────────
 * GET  v1/auth/me                                                → UserDto
 * PATCH v1/auth/me                          { firstName?, ... }  → UserDto
 * DELETE v1/auth/me                                              → void
 * POST v1/auth/refresh                      { refreshToken }     → TokensDto
 * POST v1/auth/logout                                            → void
 *
 * ─── Admin Gate (اندپوینت اختصاصی ادمین — کاملاً جدا از auth عمومی) ──────────
 * POST api/v1/admin/auth/phone/login/request-otp { phone: '9XXXXXXXXX' }      → { time, message }
 * POST api/v1/admin/auth/phone/login/verify-otp  { phone: '09XXXXXXXXX', otp } → AdminLoginResponseDto
 */
export const REAL_AUTH_PATHS = {
  // ── Phone password login ──
  login: 'v1/auth/phone/login/password',           // POST { phone, password }
  // ── Phone OTP login ──
  loginOtpSend: 'v1/auth/phone/login/request-otp', // POST { phone }
  loginOtpVerify: 'v1/auth/phone/login/verify-otp',// POST { phone, otp }
  // ── Phone register ──
  register: 'v1/auth/phone/register/request-otp',  // POST { phone, role: { id, name } }
  registerOtpVerify: 'v1/auth/phone/register/verify-otp', // POST { phone, otp }
  // ── Forgot / Reset ──
  forgotSend: 'v1/auth/forgot/password',            // POST { phone }
  forgotReset: 'v1/auth/reset/password',            // POST { phone, otp, password, hash }
  // ── Admin gate — کاملاً مسیر جداگانه، فرمت phone هم متفاوت است ────────────────
  adminOtpSend:   'v1/admin/auth/phone/login/request-otp', // POST { phone: '9XXXXXXXXX' } — بدون پیشوند ۰
  adminOtpVerify: 'v1/admin/auth/phone/login/verify-otp',  // POST { phone: '09XXXXXXXXX', otp }
  // ── Session management ──
  logout: 'v1/auth/logout',  // POST
  session: 'v1/auth/me',     // GET
  refresh: 'v1/auth/refresh',// POST { refreshToken }
  updateMe: 'v1/auth/me',    // PATCH
  deleteMe: 'v1/auth/me',    // DELETE
  roles: 'v1/auth/roles',    // GET → RoleDto[]
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

/**
 * Normalise FE `mobile` (10-digit `9XXXXXXXXX`) to Nest-expected `09XXXXXXXXX`.
 * Used for all public auth endpoints.
 */
function toPhoneBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  let phone: string;
  if (digits.length === 10 && digits.startsWith('9')) {
    phone = `0${digits}`;
  } else if (digits.length === 11 && digits.startsWith('09')) {
    phone = digits;
  } else {
    phone = digits;
  }
  return { phone };
}

/**
 * Admin request-otp بدون پیشوند ۰ می‌خواهد: '9XXXXXXXXX'
 * Admin verify-otp  با پیشوند ۰ می‌خواهد:   '09XXXXXXXXX'
 *
 * دیده‌شده در Swagger: request-otp با "9386951413" پذیرفته می‌شود،
 * verify-otp با "09386951413" پذیرفته می‌شود.
 */
function toAdminOtpSendBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  // اگر ۱۱ رقمی با 09 → پیشوند ۰ را حذف کن
  if (digits.length === 11 && digits.startsWith('09')) {
    return { phone: digits.slice(1) };
  }
  // ۱۰ رقمی (فرمت کانونیک FE که با 9 شروع می‌شود) → مستقیم بفرست
  return { phone: digits };
}

async function resolveNestRoleDto(role: UserRole): Promise<NestRoleDto> {
  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.roles);
    const list = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === 'object' &&
          Array.isArray((raw as { data?: unknown }).data)
        ? (raw as { data: unknown[] }).data
        : null;

    if (list && list.length > 0) {
      const roles: NestRoleDto[] = [];
      for (const entry of list) {
        if (!entry || typeof entry !== 'object') continue;
        const record = entry as Record<string, unknown>;
        if (typeof record.id !== 'string' && typeof record.id !== 'number') continue;
        const label = nestRoleLabel(record);
        if (!label) continue;
        roles.push({ id: String(record.id), name: label as NestRoleDto['name'] });
      }
      if (roles.length > 0) return pickNestRoleDto(roles, role);
    }
  } catch (error) {
    console.warn('⚠️ دریافت لیست نقش‌ها از سرور با خطا مواجه شد، استفاده از مقدار پیش‌فرض...', error);
  }

  const fallbackId = FALLBACK_ROLE_IDS[role] ?? '1';
  return { id: fallbackId, name: role as NestRoleDto['name'] };
}

/** ذخیره توکن‌ها + dispatch session برای LoginResponseDto عمومی { token, ..., user } */
function applyNestLoginResponse(raw: unknown, fallbackMobile?: string): User {
  const parsed = extractNestLoginResponse(raw, fallbackMobile);
  writeRealAuthTokens(parsed.tokens);
  dispatchSessionToStore({
    user: parsed.user,
    token: parsed.tokens.token,
    expiresAt: parsed.expiresAt,
  });
  return parsed.user;
}

/** ذخیره توکن‌ها + dispatch session برای AdminLoginResponseDto { token, ..., admin } */
function applyNestAdminLoginResponse(raw: unknown, fallbackMobile?: string): User {
  const parsed = extractNestAdminLoginResponse(raw, fallbackMobile);
  writeRealAuthTokens(parsed.tokens);
  dispatchSessionToStore({
    user: parsed.user,
    token: parsed.tokens.token,
    expiresAt: parsed.expiresAt,
  });
  return parsed.user;
}

// ─── Public auth ──────────────────────────────────────────────────────────────

export async function realLoginWithCredentials(
  mobile: string,
  password: string
): Promise<User> {
  guard('real-auth.bridge.login');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.login, {
    ...toPhoneBody(mobile),
    password,
  });
  return applyNestLoginResponse(raw, mobile);
}

export async function realSendLoginOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.loginOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.loginOtpSend, toPhoneBody(mobile));
}

export async function realVerifyLoginOtp(mobile: string, otp: string): Promise<User> {
  guard('real-auth.bridge.loginOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.loginOtpVerify, {
    ...toPhoneBody(mobile),
    otp,
  });
  return applyNestLoginResponse(raw, mobile);
}

export async function realRegister(mobile: string, role: UserRole): Promise<void> {
  guard('real-auth.bridge.register');
  const nestRole = await resolveNestRoleDto(role);
  await apiClient.postJson(REAL_AUTH_PATHS.register, {
    ...toPhoneBody(mobile),
    role: { id: nestRole.id, name: nestRole.name },
  });
}

/**
 * POST v1/auth/phone/register/verify-otp { phone, otp }
 * Success: Nest returns LoginResponseDto. Edge case: 201 empty body → re-fetch session.
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
    return applyNestLoginResponse(raw, mobile);
  }

  const accessToken = readRealAccessToken();
  if (accessToken) {
    const session = await realFetchSession(mobile);
    if (session) return session.user;
  }

  throw new ApiClientError(
    'پاسخ تایید ثبت‌نام فاقد نشست/توکن است. از همکار بک‌اند بخواهید LoginResponseDto برگردانند.'
  );
}

export async function realSendForgotPasswordOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.forgotSend');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotSend, toPhoneBody(mobile));
}

export async function realVerifyForgotPasswordOtp(mobile: string, otp: string): Promise<void> {
  guard('real-auth.bridge.forgotVerify');
  const { phone } = toPhoneBody(mobile);
  const digits = otp.replace(/\D/g, '');
  if (!phone || digits.length < 4) {
    throw new ApiClientError('کد تایید بازیابی نامعتبر است.');
  }
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
    hash: otp,
    password: newPassword,
  });
}

export async function realSetInitialPassword(mobile: string, newPassword: string): Promise<void> {
  guard('real-auth.bridge.initialPassword');
  void mobile;
  await apiClient.patchJson(REAL_AUTH_PATHS.updateMe, { password: newPassword });
}

// ─── Admin gate ───────────────────────────────────────────────────────────────

/**
 * POST api/v1/admin/auth/phone/login/request-otp
 * phone بدون پیشوند ۰: '9XXXXXXXXX'
 * پاسخ: { time: 60, message: '<OTP>' }
 */
export async function realSendAdminGateOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.adminOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.adminOtpSend, toAdminOtpSendBody(mobile));
}

/**
 * POST api/v1/admin/auth/phone/login/verify-otp
 * phone با پیشوند ۰: '09XXXXXXXXX'
 * پاسخ: AdminLoginResponseDto { token, refreshToken, tokenExpires, admin: { id, fname, lname, phone, role, status } }
 */
export async function realVerifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
  guard('real-auth.bridge.adminOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.adminOtpVerify, {
    ...toPhoneBody(mobile), // verify با پیشوند ۰
    otp,
  });
  // پاسخ Admin API: { token, ..., admin: { fname, lname, ... } }
  if (looksLikeNestAdminLoginResponse(raw)) {
    return applyNestAdminLoginResponse(raw, mobile);
  }
  // fallback برای سازگاری با نسخه‌های احتمالی که user برگردانند
  return applyNestLoginResponse(raw, mobile);
}

// ─── Session & refresh ────────────────────────────────────────────────────────

export async function realRefreshToken(refreshToken: string): Promise<Session | null> {
  guard('real-auth.bridge.refresh');
  if (!refreshToken) return null;

  try {
    const existingMobile = useUserStore.getState().activeUser?.mobile;
    const raw = await apiClient.postJson<unknown>(
      REAL_AUTH_PATHS.refresh,
      { refreshToken },
      refreshToken
    );

    if (looksLikeNestLoginResponse(raw)) {
      applyNestLoginResponse(raw, existingMobile);
      return toSessionFromNestLogin(raw, existingMobile);
    }

    const tokens = extractNestRefreshTokens(raw);
    writeRealAuthTokens(tokens);
    const existingUser = useUserStore.getState().activeUser;
    const expiresAt = new Date(tokens.tokenExpires).toISOString();

    if (!existingUser) return realFetchSession(existingMobile);

    const session = { user: existingUser, token: tokens.token, expiresAt };
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
  const raw = await apiClient.patchJson<unknown>(REAL_AUTH_PATHS.updateMe, body, token);
  return mapNestAuthUser(raw, useUserStore.getState().activeUser?.mobile);
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

export async function realFetchSession(fallbackMobile?: string): Promise<Session | null> {
  guard('real-auth.bridge.session');
  const mobileFallback = fallbackMobile ?? useUserStore.getState().activeUser?.mobile;
  let accessToken = readRealAccessToken();
  if (!accessToken) {
    const refreshToken = readRealRefreshToken();
    if (!refreshToken) return null;
    const rotated = await realRefreshToken(refreshToken);
    accessToken = rotated?.token ?? readRealAccessToken();
    if (!accessToken) return null;
  }

  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.session, accessToken);
    if (looksLikeNestLoginResponse(raw)) {
      return toSessionFromNestLogin(raw, mobileFallback);
    }
    const payload =
      raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data
        ? (raw as { data: unknown }).data
        : raw;
    const user = mapNestAuthUser(payload, mobileFallback);
    return {
      user,
      token: accessToken,
      expiresAt:
        readRealTokenExpiresAt() ?? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      clearRealAuthTokens();
      return null;
    }
    throw error;
  }
}
