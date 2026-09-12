import { apiClient } from '@/services/api-client';
import { parseForgotPasswordRetryAfter } from '@/services/auth/real/parse-forgot-retry-after';
import type { NestSetPasswordDto } from '@/types/nest-users';

import type { OtpCooldownResult } from './registration';
import { guard, REAL_AUTH_PATHS, toPhoneBody } from './shared';

export async function realSendForgotPasswordOtp(
  mobile: string
): Promise<OtpCooldownResult> {
  guard('real-auth.bridge.forgotSend');
  const raw = await apiClient.postJson<unknown>(
    REAL_AUTH_PATHS.forgotSend,
    toPhoneBody(mobile)
  );
  return { retryAfterSeconds: parseForgotPasswordRetryAfter(raw) };
}

export async function realResetPassword(mobile: string, otp: string, newPassword: string): Promise<void> {
  guard('real-auth.bridge.forgotReset');
  await apiClient.postMaybeJson(REAL_AUTH_PATHS.forgotReset, {
    ...toPhoneBody(mobile),
    otp,
    password: newPassword,
  });
}

export async function realSetPassword(body: NestSetPasswordDto): Promise<void> {
  guard('real-auth.bridge.setPassword');
  await apiClient.postMaybeJson(REAL_AUTH_PATHS.setPassword, {
    oldPassword: body.oldPassword,
    newPassword: body.newPassword,
  });
}
