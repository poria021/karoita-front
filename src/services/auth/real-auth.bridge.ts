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
  readRealTokenExpiresAt,
  writeRealAuthTokens,
} from '@/services/auth/real-auth.tokens';
import { dispatchSessionToStore } from '@/services/auth/mock-auth.store';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User, UserRole } from '@/types/auth';

const NEST_AUTH_LIVE = true;

const FALLBACK_ROLE_IDS: Record<string, string> = {
  student: '6a43982fceda93d39f5d3493',
  skill_learner: '6a43982fceda93d39f5d3494',
  supervisor_professor: '6a43982fceda93d39f5d3495',
  mentor_teacher: '6a43982fceda93d39f5d3496',
  school_principal: '6a43982fceda93d39f5d3497',
};

export const REAL_AUTH_PATHS = {
  login: 'v1/auth/phone/login/password',
  loginOtpSend: 'v1/auth/phone/login/request-otp',
  loginOtpVerify: 'v1/auth/phone/login/verify-otp',
  register: 'v1/auth/phone/register/request-otp',
  registerOtpVerify: 'v1/auth/phone/register/verify-otp',
  forgotSend: 'v1/auth/forgot/password',
  forgotReset: 'v1/auth/reset/password',
  adminOtpSend: 'v1/admin/auth/phone/login/request-otp',
  adminOtpVerify: 'v1/admin/auth/phone/login/verify-otp',
  logout: 'v1/auth/logout',
  session: 'v1/auth/me',
  updateMe: 'v1/auth/me',
  deleteMe: 'v1/auth/me',
  roles: 'v1/auth/roles',
} as const;

function requireApiConfigured(surface: string): void {
  if (!apiClient.isConfigured) throwRealModeNotImplemented(surface);
}

function assertNestLive(surface: string): void {
  if (!NEST_AUTH_LIVE) throwRealModeNotImplemented(surface);
}

function guard(surface: string): void {
  requireApiConfigured(surface);
  assertNestLive(surface);
}

function toPhoneBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) return { phone: `0${digits}` };
  if (digits.length === 11 && digits.startsWith('09')) return { phone: digits };
  return { phone: digits };
}

function toAdminOtpSendBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('09')) return { phone: digits.slice(1) };
  return { phone: digits };
}

async function resolveNestRoleDto(role: UserRole): Promise<NestRoleDto> {
  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.roles);
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)
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

async function applyNestLoginResponse(raw: unknown, fallbackMobile?: string): Promise<User> {
  const parsed = extractNestLoginResponse(raw, fallbackMobile);
  await writeRealAuthTokens(parsed.tokens);
  dispatchSessionToStore({ user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt });
  return parsed.user;
}

async function applyNestAdminLoginResponse(raw: unknown, fallbackMobile?: string): Promise<User> {
  const parsed = extractNestAdminLoginResponse(raw, fallbackMobile);
  await writeRealAuthTokens(parsed.tokens);
  dispatchSessionToStore({ user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt });
  return parsed.user;
}

// ─── Public auth ──────────────────────────────────────────────────────────────

export async function realLoginWithCredentials(mobile: string, password: string): Promise<User> {
  guard('real-auth.bridge.login');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.login, { ...toPhoneBody(mobile), password });
  return applyNestLoginResponse(raw, mobile);
}

export async function realSendLoginOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.loginOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.loginOtpSend, toPhoneBody(mobile));
}

export async function realVerifyLoginOtp(mobile: string, otp: string): Promise<User> {
  guard('real-auth.bridge.loginOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.loginOtpVerify, { ...toPhoneBody(mobile), otp });
  return applyNestLoginResponse(raw, mobile);
}

export async function realRegister(mobile: string, role: UserRole): Promise<void> {
  guard('real-auth.bridge.register');
  const nestRole = await resolveNestRoleDto(role);
  await apiClient.postJson(REAL_AUTH_PATHS.register, { ...toPhoneBody(mobile), role: { id: nestRole.id, name: nestRole.name } });
}

export async function realVerifyRegistrationOtp(mobile: string, otp: string, _role: UserRole): Promise<User> {
  void _role;
  guard('real-auth.bridge.registerOtpVerify');
  const raw = await apiClient.postMaybeJson<unknown>(REAL_AUTH_PATHS.registerOtpVerify, { ...toPhoneBody(mobile), otp });
  if (raw && looksLikeNestLoginResponse(raw)) return applyNestLoginResponse(raw, mobile);
  const accessToken = readRealAccessToken();
  if (accessToken) {
    const session = await realFetchSession(mobile);
    if (session) return session.user;
  }
  throw new ApiClientError('پاسخ تایید ثبت‌نام فاقد نشست/توکن است. از همکار بک‌اند بخواهید LoginResponseDto برگردانند.');
}

export async function realSendForgotPasswordOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.forgotSend');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotSend, toPhoneBody(mobile));
}

export async function realVerifyForgotPasswordOtp(mobile: string, otp: string): Promise<void> {
  guard('real-auth.bridge.forgotVerify');
  const { phone } = toPhoneBody(mobile);
  const digits = otp.replace(/\D/g, '');
  if (!phone || digits.length < 4) throw new ApiClientError('کد تایید بازیابی نامعتبر است.');
}

export async function realResetPassword(mobile: string, otp: string, newPassword: string): Promise<void> {
  guard('real-auth.bridge.forgotReset');
  await apiClient.postJson(REAL_AUTH_PATHS.forgotReset, { ...toPhoneBody(mobile), otp, hash: otp, password: newPassword });
}

export async function realSetInitialPassword(mobile: string, newPassword: string): Promise<void> {
  guard('real-auth.bridge.initialPassword');
  void mobile;
  await apiClient.patchJson(REAL_AUTH_PATHS.updateMe, { password: newPassword });
}

// ─── Admin gate ───────────────────────────────────────────────────────────────

export async function realSendAdminGateOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.adminOtpSend');
  await apiClient.postJson(REAL_AUTH_PATHS.adminOtpSend, toAdminOtpSendBody(mobile));
}

export async function realVerifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
  guard('real-auth.bridge.adminOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.adminOtpVerify, { ...toPhoneBody(mobile), otp });
  if (looksLikeNestAdminLoginResponse(raw)) return applyNestAdminLoginResponse(raw, mobile);
  return applyNestLoginResponse(raw, mobile);
}

// ─── Session & refresh ────────────────────────────────────────────────────────

let refreshInFlight: Promise<Session | null> | null = null;

/**
 * /api/auth/refresh را صدا می‌زند — httpOnly cookie را می‌فرستد.
 * در صورت 401/403 فقط null برمی‌گرداند؛ clearRealAuthTokens را صدا نمی‌زند
 * تا caller بتواند تصمیم بگیرد (مثلاً AppAuthGuard که می‌خواهد به login redirect کند).
 *
 * Single-flight: در هر تب فقط یک POST /api/auth/refresh هم‌زمان در پرواز است —
 * caller دیگر (مثلاً ky 401 hook از یک درخواست موازی) همین Promise را به اشتراک
 * می‌گذارد. بدون این de-dup، دو درخواست هم‌زمان با یک مقدار httpOnly cookie
 * قدیمی به سرور می‌رسند؛ اولی refresh token را rotate می‌کند، دومی با توکن
 * already-rotated رد می‌شود (401) و session کاملاً معتبر را پاک می‌کند.
 */
export function realRefreshToken(_refreshToken?: string): Promise<Session | null> {
  void _refreshToken;
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = performRealRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function performRealRefresh(): Promise<Session | null> {
  try {
    const existingMobile = useUserStore.getState().activeUser?.mobile;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (res.status === 401 || res.status === 403) {
      // کوکی منقضی — فقط null برگردان، cleanup با caller است
      return null;
    }

    if (!res.ok) {
      throw new ApiClientError(`تمدید نشست ناموفق: ${res.status}`);
    }

    const raw: unknown = await res.json();

    // ادمین لاگین‌رسپانس را اول چک کن (data.admin بجای data.user)
    if (looksLikeNestAdminLoginResponse(raw)) {
      const parsed = extractNestAdminLoginResponse(raw, existingMobile);
      await writeRealAuthTokens(parsed.tokens);
      dispatchSessionToStore({ user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt });
      return { user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt };
    }

    if (looksLikeNestLoginResponse(raw)) {
      await applyNestLoginResponse(raw, existingMobile);
      return toSessionFromNestLogin(raw, existingMobile);
    }

    const tokens = extractNestRefreshTokens(raw);
    await writeRealAuthTokens(tokens);

    const existingUser = useUserStore.getState().activeUser;

    // store خالیه (تب تازه‌باز‌شده / reload) — باید /auth/me بزنیم تا user
    // object کامل بگیریم. این تنها جایی‌ست که این تابع realFetchSession را
    // صدا می‌زند، و نتیجه را حتماً به store دیسپچ می‌کند — caller
    // (AuthService.refreshRealSession) دیگر لازم نیست دوباره /auth/me بزند.
    if (!existingUser) {
      // tokens.token را صریح پاس می‌دهیم — اگر realFetchSession را وادار به خواندن دوبارهٔ
      // memory کنیم و به هر دلیلی (مثلاً skew) خالی ببیند، خودش دوباره
      // realRefreshToken را صدا می‌زند که همان Promise در حال اجرا را برمی‌گرداند
      // و deadlock می‌شود.
      const session = await realFetchSession(existingMobile, tokens.token);
      if (session) dispatchSessionToStore(session);
      return session;
    }

    const session: Session = {
      user: existingUser,
      token: tokens.token,
      expiresAt: new Date(tokens.tokenExpires).toISOString(),
    };
    dispatchSessionToStore(session);
    return session;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}

export async function realUpdateMe(
  body: { photo?: { id: string }; firstName?: string; lastName?: string; email?: string; password?: string; oldPassword?: string },
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

export async function realFetchSession(
  fallbackMobile?: string,
  explicitAccessToken?: string
): Promise<Session | null> {
  guard('real-auth.bridge.session');
  const mobileFallback = fallbackMobile ?? useUserStore.getState().activeUser?.mobile;

  let accessToken = explicitAccessToken ?? readRealAccessToken();
  if (!accessToken) {
    const rotated = await realRefreshToken();
    if (!rotated) return null;
    accessToken = rotated.token;
  }

  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.session, accessToken);
    if (looksLikeNestLoginResponse(raw)) return toSessionFromNestLogin(raw, mobileFallback);
    const payload =
      raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data
        ? (raw as { data: unknown }).data
        : raw;
    const user = mapNestAuthUser(payload, mobileFallback);
    return {
      user,
      token: accessToken,
      expiresAt: readRealTokenExpiresAt() ?? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}
