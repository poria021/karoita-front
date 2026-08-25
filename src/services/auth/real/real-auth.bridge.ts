import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient, ApiClientError } from '@/services/api-client';
import {
  extractNestAdminLoginResponse,
  extractNestLoginResponse,
  extractNestRefreshTokens,
  looksLikeNestAdminLoginResponse,
  looksLikeNestLoginResponse,
  mapNestAdminUser,
  mapNestAuthUser,
  toSessionFromNestLogin,
} from '@/services/auth/real/nest-auth-mappers';
import {
  nestRoleLabel,
  pickNestRoleDto,
  type NestRoleDto,
} from '@/services/auth/real/nest-auth-role';
import {
  clearRealAuthTokens,
  readRealAccessToken,
  readRealAuthSurface,
  readRealTokenExpiresAt,
  writeRealAuthTokens,
} from '@/services/auth/real/real-auth.tokens';
import { dispatchSessionToStore } from '@/services/auth/mock/mock-auth.store';
import { useUserStore } from '@/store/useUserStore';
import type { Session, User, UserRole } from '@/types/auth';

/** surface جاری session را می‌خواند — در browser از cookie، خارج از browser 'user' */
function currentSurface(): 'admin' | 'user' {
  return readRealAuthSurface() ?? 'user';
}

const NEST_AUTH_LIVE = true;

/**
 * ⚠️ این ثابت‌ها فقط برای مقایسهٔ سریع در تست‌ها نگه‌داشته شده‌اند و دیگر
 * در runtime استفاده نمی‌شوند. resolveNestRoleDto در صورت شکست GET /auth/roles
 * یک خطای صریح می‌دهد، نه fallback خاموش.
 *
 * @deprecated — به‌جای این، خطا از سرور به کاربر نمایش داده می‌شود.
 */
export const _DEPRECATED_FALLBACK_ROLE_IDS: Readonly<Record<string, string>> = {
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
  adminRefresh: 'v1/admin/auth/refresh',
  adminSession: 'v1/admin/auth/me',
  adminLogout: 'v1/admin/auth/logout',
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

/**
 * شناسهٔ Nest مربوط به نقش کاربر را از GET /auth/roles می‌خواند.
 *
 * چرا fallback حذف شد؟
 *  - این تابع برای یک عملیات نوشتاری (ثبت‌نام) فراخوانی می‌شود — نقش اشتباه
 *    یعنی کاربر با دسترسی‌های غلط ثبت‌نام می‌کند و بعداً به مشکلات جدی
 *    authorization برمی‌خورد.
 *  - اگر IDها در بک‌اند تغییر کرده باشند، fallback hardcode خاموشانه باگ
 *    تولید می‌کند — سخت‌ترین نوع برای دیباگ.
 *  - خطای صریح به کاربر («دریافت لیست نقش‌ها ناموفق بود، دوباره تلاش کنید»)
 *    قابل‌فهم و قابل‌اقدام است؛ ثبت‌نام با نقش اشتباه قابل‌فهم نیست.
 */
async function resolveNestRoleDto(role: UserRole): Promise<NestRoleDto> {
  let lastError: unknown;

  // تا ۲ بار تلاش می‌کنیم — خطاهای شبکهٔ گذرا رو پوشش می‌دیم
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 400));

    try {
      const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.roles);
      const list = Array.isArray(raw)
        ? raw
        : raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)
          ? (raw as { data: unknown[] }).data
          : null;

      if (!list || list.length === 0) {
        throw new Error('لیست نقش‌ها از سرور خالی یا نامعتبر بود.');
      }

      const roles: NestRoleDto[] = [];
      for (const entry of list) {
        if (!entry || typeof entry !== 'object') continue;
        const record = entry as Record<string, unknown>;
        if (typeof record.id !== 'string' && typeof record.id !== 'number') continue;
        const label = nestRoleLabel(record);
        if (!label) continue;
        roles.push({ id: String(record.id), name: label as NestRoleDto['name'] });
      }

      if (roles.length === 0) {
        throw new Error('هیچ نقش معتبری در پاسخ سرور یافت نشد.');
      }

      // pickNestRoleDto در صورت نیافتن نقش throw می‌کند — آن را bubble بده
      return pickNestRoleDto(roles, role);
    } catch (error) {
      lastError = error;
      // ۴xx: مشکل سمت کلاینت یا تغییر API — retry فایده ندارد
      if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) break;
    }
  }

  // همهٔ تلاش‌ها شکست خوردند — خطای صریح و قابل‌فهم به کاربر
  console.error('[real-auth.bridge] resolveNestRoleDto failed after retries', lastError);
  throw new ApiClientError(
    'دریافت لیست نقش‌ها از سرور ناموفق بود. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
  );
}

async function applyNestLoginResponse(raw: unknown, fallbackMobile?: string): Promise<User> {
  const parsed = extractNestLoginResponse(raw, fallbackMobile);
  await writeRealAuthTokens(parsed.tokens);
  dispatchSessionToStore({ user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt });
  return parsed.user;
}

async function applyNestAdminLoginResponse(raw: unknown, fallbackMobile?: string): Promise<User> {
  const parsed = extractNestAdminLoginResponse(raw, fallbackMobile);
  // سارفیس 'admin' را پاس می‌کنیم تا /api/auth/refresh بداند کدام Nest endpoint بزند
  await writeRealAuthTokens(parsed.tokens, 'admin');
  dispatchSessionToStore({ user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt });
  return parsed.user;
}

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
  throw new ApiClientError('پاسخ تایید ثبت‌نام فاقد نشست/توکن است.');
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

let refreshInFlight: Promise<Session | null> | null = null;

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

    // refresh token باطل/منقضی → پاکسازی فوری و برگشت به login
    if (res.status === 401 || res.status === 403) {
      clearRealAuthTokens();
      dispatchSessionToStore(null);
      return null;
    }

    if (!res.ok) {
      throw new ApiClientError(`تمدید نشست ناموفق: ${res.status}`);
    }

    const raw: unknown = await res.json();

    // route.ts قبلاً /admin/auth/me یا /auth/me را زده و admin/user object را ضمیمه کرده.
    // پس فقط parse می‌کنیم — هیچ درخواست شبکه‌ای اضافه نداریم.

    // ۱. پاسخ ادمین: شامل admin object است
    if (looksLikeNestAdminLoginResponse(raw)) {
      const parsed = extractNestAdminLoginResponse(raw, existingMobile);
      await writeRealAuthTokens(parsed.tokens, 'admin');
      const session: Session = { user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt };
      dispatchSessionToStore(session);
      return session;
    }

    // ۲. پاسخ کاربر عمومی: شامل user object است (route.ts از /auth/me آورده)
    if (looksLikeNestLoginResponse(raw)) {
      const parsed = extractNestLoginResponse(raw, existingMobile);
      await writeRealAuthTokens(parsed.tokens, 'user');
      const session: Session = { user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt };
      dispatchSessionToStore(session);
      return session;
    }

    // ۳. fallback نادر: Nest فقط { token, refreshToken, tokenExpires } برگرداند
    //    و fetchSessionUser در route.ts هم fail شد (مثلاً /auth/me در دسترس نبود).
    //    token را ذخیره می‌کنیم و مستقیم /auth/me می‌زنیم.
    try {
      const tokens = extractNestRefreshTokens(raw);
      const surface = currentSurface();
      await writeRealAuthTokens(tokens, surface);

      const fallbackSession = await realFetchSession(existingMobile, tokens.token);
      if (fallbackSession) {
        dispatchSessionToStore(fallbackSession);
        return fallbackSession;
      }
    } catch {
      // پاسخ Nest نه token داشت نه user — پاکسازی کامل
    }

    // هیچ راهی نماند — پاکسازی کامل
    clearRealAuthTokens();
    dispatchSessionToStore(null);
    return null;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      clearRealAuthTokens();
      dispatchSessionToStore(null);
      return null;
    }
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
  const surface = currentSurface();
  const logoutPath = surface === 'admin' ? REAL_AUTH_PATHS.adminLogout : REAL_AUTH_PATHS.logout;
  try {
    await apiClient.postJson(logoutPath, {});
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
  const surface = currentSurface();

  // explicitAccessToken اولویت دارد؛ اگر نبود از memory بخوان.
  // عمداً refresh نمی‌زنیم — caller مسئول تأمین token است.
  const accessToken = explicitAccessToken ?? readRealAccessToken();
  if (!accessToken) return null;

  try {
    // برای ادمین /admin/auth/me، برای user عمومی /auth/me
    const sessionPath = surface === 'admin' ? REAL_AUTH_PATHS.adminSession : REAL_AUTH_PATHS.session;
    const raw = await apiClient.getJson<unknown>(sessionPath, accessToken);

    // پاسخ ادمین: شامل admin object است
    if (looksLikeNestAdminLoginResponse(raw)) {
      return {
        user: extractNestAdminLoginResponse(raw, mobileFallback).user,
        token: accessToken,
        expiresAt: readRealTokenExpiresAt() ?? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (looksLikeNestLoginResponse(raw)) return toSessionFromNestLogin(raw, mobileFallback);

    // پاسخ خام GET /auth/me یا /admin/auth/me: فقط یک شیء object با id برمی‌گرداند
    const payload =
      raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data
        ? (raw as { data: unknown }).data
        : raw;

    // برای ادمین mapNestAdminUser بگیریم وگرنه mapNestAuthUser
    const user = surface === 'admin'
      ? mapNestAdminUser(payload, mobileFallback)
      : mapNestAuthUser(payload, mobileFallback);

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
