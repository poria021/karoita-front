import { apiClient } from '@/services/api-client';
import { dispatchSessionToStore } from '@/services/auth/dispatch-session';
import {
  extractNestAdminLoginResponse,
  extractNestLoginResponse,
} from '@/services/auth/real/nest-auth-mappers';
import { writeRealAuthTokens } from '@/services/auth/real/real-auth.tokens';
import type { User } from '@/types/auth';

import { guard, REAL_AUTH_PATHS, toPhoneBody } from './shared';

export async function applyNestLoginResponse(raw: unknown, fallbackMobile?: string): Promise<User> {
  const parsed = extractNestLoginResponse(raw, fallbackMobile);
  await writeRealAuthTokens(parsed.tokens, 'user');
  dispatchSessionToStore({ user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt });
  return parsed.user;
}

export async function applyNestAdminLoginResponse(raw: unknown, fallbackMobile?: string): Promise<User> {
  const parsed = extractNestAdminLoginResponse(raw, fallbackMobile);
  // surface `admin` تا `/api/auth/refresh` مسیر ادمین Nest را بزند
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
  await apiClient.postMaybeJson(REAL_AUTH_PATHS.loginOtpSend, toPhoneBody(mobile));
}

export async function realVerifyLoginOtp(mobile: string, otp: string): Promise<User> {
  guard('real-auth.bridge.loginOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.loginOtpVerify, { ...toPhoneBody(mobile), otp });
  return applyNestLoginResponse(raw, mobile);
}
