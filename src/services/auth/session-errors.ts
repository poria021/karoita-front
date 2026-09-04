/**
 * خطاهای نشست مشترک — بدون وابستگی به mock یا real.
 * UI و Facade فقط از اینجا / AuthService استفاده کنند.
 */

export class SessionTransientError extends Error {
  readonly kind = 'transient' as const;

  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'SessionTransientError';
  }
}

export function isSessionTransientError(
  error: unknown
): error is SessionTransientError {
  return error instanceof SessionTransientError;
}

export const TRANSIENT_RESTORE_MESSAGE =
  'برقراری ارتباط با سرور ممکن نیست. اتصال را بررسی کنید و دوباره تلاش کنید.';
