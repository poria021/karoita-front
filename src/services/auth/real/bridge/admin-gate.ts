import { apiClient } from '@/services/api-client';
import { looksLikeNestAdminLoginResponse } from '@/services/auth/real/nest-auth-mappers';
import type { User } from '@/types/auth';

import { applyNestAdminLoginResponse, applyNestLoginResponse } from './login';
import { guard, REAL_AUTH_PATHS, toAdminOtpSendBody, toPhoneBody } from './shared';

export async function realSendAdminGateOtp(mobile: string): Promise<void> {
  guard('real-auth.bridge.adminOtpSend');
  await apiClient.postMaybeJson(REAL_AUTH_PATHS.adminOtpSend, toAdminOtpSendBody(mobile));
}

export async function realVerifyAdminGateOtp(mobile: string, otp: string): Promise<User> {
  guard('real-auth.bridge.adminOtpVerify');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.adminOtpVerify, { ...toPhoneBody(mobile), otp });
  if (looksLikeNestAdminLoginResponse(raw)) return applyNestAdminLoginResponse(raw, mobile);
  return applyNestLoginResponse(raw, mobile);
}
