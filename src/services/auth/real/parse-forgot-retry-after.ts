/**
 * پاسخ OTP Nest فیلد `time` = cooldown ثانیه است. `message` را نشان نده — بعضی محیط‌ها خود OTP را آنجا می‌گذارند.
 */
export const DEFAULT_FORGOT_RETRY_AFTER_SECONDS = 60;
const MAX_FORGOT_RETRY_AFTER_SECONDS = 600;

export function parseForgotPasswordRetryAfter(raw: unknown): number {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_FORGOT_RETRY_AFTER_SECONDS;
  }

  const time = (raw as { time?: unknown }).time;
  if (typeof time !== 'number' || !Number.isFinite(time)) {
    return DEFAULT_FORGOT_RETRY_AFTER_SECONDS;
  }

  return Math.min(
    MAX_FORGOT_RETRY_AFTER_SECONDS,
    Math.max(0, Math.round(time))
  );
}
