import { ApiClientError } from '@/services/api-client';

export function readAuthErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** خطاهای OTP روی verify-otp یا reset/password — برای نمایش روی فیلد کد. */
export function isOtpAuthError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.message.includes('کد تایید')) return true;
    const payload = error.payload;
    if (payload && typeof payload === 'object' && 'errors' in payload) {
      const errors = (payload as { errors: unknown }).errors;
      if (errors && typeof errors === 'object' && 'hash' in errors) return true;
    }
  }
  return false;
}
