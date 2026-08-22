/**
 * Nest auth transport — AuthService when API_MODE=real.
 * Phone login/register/OTP/session/refresh/logout/me match backenddev OpenAPI.
 * Forgot: Nest has no verify-otp route; OTP is the reset `hash`.
 * Set-initial-password: PATCH /auth/me { password } while logged in.
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
 * ─── Admin Gate (reuses phone-login OTP until Nest adds dedicated admin route) ─
 * POST v1/auth/phone/login/request-otp      { phone }            → void
 * POST v1/auth/phone/login/verify-otp       { phone, otp }       → LoginResponseDto
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
  // ── Admin gate — shares OTP login until Nest exposes a dedicated admin route ──
  adminOtpSend: 'v1/auth/phone/login/request-otp',  // POST { phone } (same as loginOtpSend)
  adminOtpVerify: 'v1/auth/phone/login/verify-otp', // POST { phone, otp } (same as loginOtpVerify)
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
 * Normalise FE `mobile` (10-digit `9XXXXXXXXX`, without leading zero) to the
 * Nest-expected 11-digit `09XXXXXXXXX` format.
 *
 * Schema stores numbers WITHOUT a leading `0`; Nest validators require it.
 * Example: `9123456789` → `09123456789`.
 */
function toPhoneBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');

  let phone: string;
  if (digits.length === 10 && digits.startsWith('9')) {
    // FE canonical form — prepend leading zero for Nest.
    phone = `0${digits}`;
  } else if (digits.length === 11 && digits.startsWith('09')) {
    // Already in Nest format (e.g. pre-filled from remembered mobile).
    phone = digits;
  } else {
    // Unexpected input — pass through and let Nest validate.
    phone = digits;
  }

  return { phone };
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

      if (roles.length > 0) {
        return pickNestRoleDto(roles, role);
      }
    }
  } catch (error) {
    console.warn(
      '⚠️ دریافت لیست نقش‌ها از سرور با خطا مواجه شد، استفاده از مقدار پیش‌فرض...',
      error
    );
  }

  // Fallback مقاوم در صورت خطای اندپوینت roles
  const fallbackId = FALLBACK_ROLE_IDS[role] ?? '1';
  return {
    id: fallbackId,
    name: role as NestRoleDto['name'],
  };
}

async function applyNestLoginResponse(
  raw: unknown,
  fallbackMobile?: string
): Promise<User> {
  const parsed = extractNestLoginResponse(raw, fallbackMobile);
  await writeRealAuthTokens(parsed.tokens);
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
  return applyNestLoginResponse(raw, mobile);
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
  return applyNestLoginResponse(raw, mobile);
}

export async function realRegister(
  mobile: string,
  role: UserRole
): Promise<void> {
  guard('real-auth.bridge.register');
  const nestRole = await resolveNestRoleDto(role);
  await apiClient.postJson(REAL_AUTH_PATHS.register, {
    ...toPhoneBody(mobile),
    role: { id: nestRole.id, name: nestRole.name},
  });
}

/**
 * POST v1/auth/phone/register/verify-otp { phone, otp }
 *
 * Nest AuthConfirmPhoneDto is only `{ phone, otp }` — role was already sent on
 * request-otp. `role` stays on the Facade signature for mock + post-verify UX.
 *
 * Success: Nest returns LoginResponseDto `{ token, refreshToken, tokenExpires, user }`.
 * Edge case: 201 with empty body → we re-fetch session instead of throwing.
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

  // Happy path — Nest returned a full LoginResponseDto.
  if (raw && looksLikeNestLoginResponse(raw)) {
    return applyNestLoginResponse(raw, mobile);
  }

  // Edge-case: Nest returned 201 with no body (register-then-redirect design).
  // Try to read the session from GET /auth/me using any token already stored.
  const accessToken = readRealAccessToken();
  if (accessToken) {
    const session = await realFetchSession(mobile);
    if (session) return session.user;
  }

  // Hard fail — ask the backend team to return LoginResponseDto.
  throw new ApiClientError(
    'پاسخ تایید ثبت‌نام فاقد نشست/توکن است. از همکار بک‌اند بخواهید LoginResponseDto برگردانند.'
  );
}

/**
 * POST v1/auth/forgot/password { phone }
 *
 * Sends an OTP (or reset hash) to the phone number for password recovery.
 */
export async function realSendForgotPasswordOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.forgotSend');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotSend, toPhoneBody(mobile));
}

/**
 * Client-side gate before the reset step.
 *
 * Nest OpenAPI (backenddev.darkube.ir/docs) has NO dedicated forgot-verify route:
 * the OTP / hash is consumed directly on POST v1/auth/reset/password.
 * This function is therefore a client-side validation only — it checks that the
 * code is at least 4 digits before allowing the user to proceed to Step 3.
 *
 * If the backend later adds a verify endpoint, replace this with an apiClient call.
 */
export async function realVerifyForgotPasswordOtp(
  mobile: string,
  otp: string
): Promise<void> {
  guard('real-auth.bridge.forgotVerify');
  const { phone } = toPhoneBody(mobile);
  const digits = otp.replace(/\D/g, '');
  if (!phone || digits.length < 4) {
    throw new ApiClientError('کد تایید بازیابی نامعتبر است.');
  }
  // No API call — OTP/hash will be verified server-side on POST /reset/password.
}

/**
 * POST v1/auth/reset/password { phone, otp, password, hash }
 *
 * Resets the user’s password. The backend accepts the OTP both as `otp` and as
 * `hash` (Nest AuthResetPasswordDto) — we send both to maximise compatibility.
 */
export async function realResetPassword(
  mobile: string,
  otp: string,
  newPassword: string
): Promise<void> {
  guard('real-auth.bridge.forgotReset');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotReset, {
    ...toPhoneBody(mobile),
    otp,
    hash: otp,      // Nest AuthResetPasswordDto uses `hash` as the OTP/token field.
    password: newPassword,
  });
}

export async function realSetInitialPassword(
  mobile: string,
  newPassword: string
): Promise<void> {
  guard('real-auth.bridge.initialPassword');
  void mobile;
  await apiClient.patchJson(REAL_AUTH_PATHS.updateMe, { password: newPassword });
}

export async function realSendAdminGateOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.adminOtpSend');
  // Uses the dedicated adminOtpSend path (currently same as loginOtpSend).
  // When Nest exposes a separate admin route, update REAL_AUTH_PATHS.adminOtpSend.
  await apiClient.postJson(REAL_AUTH_PATHS.adminOtpSend, toPhoneBody(mobile));
}

export async function realVerifyAdminGateOtp(
  mobile: string,
  otp: string
): Promise<User> {
  guard('real-auth.bridge.adminOtpVerify');
  // Uses the dedicated adminOtpVerify path (currently same as loginOtpVerify).
  // When Nest exposes a separate admin route, update REAL_AUTH_PATHS.adminOtpVerify.
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.adminOtpVerify, {
    ...toPhoneBody(mobile),
    otp,
  });
  return applyNestLoginResponse(raw, mobile);
}

/**
 * Rotates the Nest access token using the httpOnly refresh cookie.
 *
 * Deliberately does NOT go through `apiClient`/ky: it calls this app's own
 * `POST /api/auth/refresh` Route Handler with a plain `fetch`, which reads
 * `karvita_rt` (httpOnly, server-only) and forwards to Nest itself — the
 * refresh token never exists as a value inside browser JS. See
 * `src/app/api/auth/refresh/route.ts` and `src/lib/real-auth-cookie.ts`.
 */
export async function realRefreshToken(): Promise<Session | null> {
  guard('real-auth.bridge.refresh');
  if (typeof window === 'undefined') return null;

  try {
    const existingMobile = useUserStore.getState().activeUser?.mobile;
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.status === 401) {
      clearRealAuthTokens();
      return null;
    }
    if (!response.ok) {
      throw new ApiClientError('تمدید نشست با خطا مواجه شد.', response.status);
    }

    const raw: unknown = await response.json();

    if (looksLikeNestLoginResponse(raw)) {
      await applyNestLoginResponse(raw, existingMobile);
      return toSessionFromNestLogin(raw, existingMobile);
    }

    const tokens = extractNestRefreshTokens(raw);
    await writeRealAuthTokens(tokens);
    const existingUser = useUserStore.getState().activeUser;
    const expiresAt = new Date(tokens.tokenExpires).toISOString();

    if (!existingUser) {
      return realFetchSession(existingMobile);
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

export async function realFetchSession(
  fallbackMobile?: string
): Promise<Session | null> {
  guard('real-auth.bridge.session');
  const mobileFallback =
    fallbackMobile ?? useUserStore.getState().activeUser?.mobile;
  let accessToken = readRealAccessToken();
  if (!accessToken) {
    const rotated = await realRefreshToken();
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
      return toSessionFromNestLogin(raw, mobileFallback);
    }
    const payload =
      raw &&
      typeof raw === 'object' &&
      'data' in raw &&
      (raw as { data: unknown }).data
        ? (raw as { data: unknown }).data
        : raw;
    const user = mapNestAuthUser(payload, mobileFallback);
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