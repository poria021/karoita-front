import { apiClient, ApiClientError } from '@/services/api-client';
import { parseForgotPasswordRetryAfter } from '@/services/auth/real/parse-forgot-retry-after';
import { looksLikeNestLoginResponse } from '@/services/auth/real/nest-auth-mappers';
import {
  nestRoleLabel,
  pickNestRoleDto,
  type NestRoleDto,
} from '@/services/auth/real/nest-auth-role';
import { readRealAccessToken } from '@/services/auth/real/real-auth.tokens';
import type { User, UserRole } from '@/types/auth';

import { applyNestLoginResponse } from './login';
import { realFetchSession } from './session';
import { guard, REAL_AUTH_PATHS, toPhoneBody } from './shared';

export type OtpCooldownResult = {
  retryAfterSeconds: number;
};

/** @deprecated به‌جای این از `OtpCooldownResult` استفاده کنید */
export type ForgotPasswordOtpResult = OtpCooldownResult;

/**
 * `role.id` از `GET /auth/roles`. fallback هاردکد ممنوع — نقش اشتباه در ثبت‌نام authorization را خراب می‌کند.
 */
async function resolveNestRoleDto(role: UserRole): Promise<NestRoleDto> {
  let lastError: unknown;

  // دو تلاش برای خطای شبکهٔ گذرا
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

      return pickNestRoleDto(roles, role);
    } catch (error) {
      lastError = error;
      // ۴xx با retry درست نمی‌شود
      if (
        error instanceof ApiClientError &&
        typeof error.status === 'number' &&
        error.status >= 400 &&
        error.status < 500
      ) {
        break;
      }
    }
  }

  console.error('[real-auth.bridge] resolveNestRoleDto failed after retries', lastError);
  throw new ApiClientError(
    'دریافت لیست نقش‌ها از سرور ناموفق بود. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
  );
}

export async function realRegister(mobile: string, role: UserRole): Promise<OtpCooldownResult> {
  guard('real-auth.bridge.register');
  const nestRole = await resolveNestRoleDto(role);
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.register, { ...toPhoneBody(mobile), role: { id: nestRole.id, name: nestRole.name } });
  return { retryAfterSeconds: parseForgotPasswordRetryAfter(raw) };
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
