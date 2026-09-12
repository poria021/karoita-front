import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient } from '@/services/api-client';
import { readRealAuthSurface } from '@/services/auth/real/real-auth.tokens';

/** سطح سشن از حافظه؛ بدون حدس `'user'`. */
export function currentSurface(): 'admin' | 'user' | null {
  return readRealAuthSurface();
}

const NEST_AUTH_LIVE = true;

/**
 * فقط برای مقایسه در تست؛ runtime دیگر fallback ندارد — شکست `GET /auth/roles` یعنی خطا.
 * @deprecated
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
  setPassword: 'v1/auth/set/password',
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

export function guard(surface: string): void {
  requireApiConfigured(surface);
  assertNestLive(surface);
}

export function toPhoneBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) return { phone: `0${digits}` };
  if (digits.length === 11 && digits.startsWith('09')) return { phone: digits };
  return { phone: digits };
}

export function toAdminOtpSendBody(mobile: string): { phone: string } {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('09')) return { phone: digits.slice(1) };
  return { phone: digits };
}
