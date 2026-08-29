/**
 * Nest OTP send endpoints (`forgot/password`, `register/request-otp`, …) return `{ time, message? }`.
 *
 * `time` is the resend cooldown in seconds. `message` is ignored on purpose:
 * some environments put the OTP itself there, and the UI must never display it.
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
