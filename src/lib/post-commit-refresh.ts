import { toast } from 'sonner';

/**
 * GET بعد از write موفق — شکست تازه‌سازی ≠ شکست ذخیره.
 * UI خوش‌بینانه را revert نکنید؛ فقط هشدار تازه‌سازی بدهید.
 */
export const POST_COMMIT_REFRESH_TOAST =
  'تغییر ذخیره شد، اما فهرست تازه‌سازی نشد. در صورت نیاز صفحه را یک‌بار نوسازی کنید.';

export class PostCommitRefreshError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super(POST_COMMIT_REFRESH_TOAST);
    this.name = 'PostCommitRefreshError';
    this.cause = cause;
  }
}

export function isPostCommitRefreshError(
  error: unknown
): error is PostCommitRefreshError {
  return error instanceof PostCommitRefreshError;
}

/** Write موفق است؛ اگر reload بترکد، همان را به‌صورت قرارداد جدا پرتاب کن. */
export async function reloadAfterWrite<T>(reload: () => Promise<T>): Promise<T> {
  try {
    return await reload();
  } catch (error) {
    throw new PostCommitRefreshError(error);
  }
}

export function notifyPostCommitRefreshFailure(): void {
  toast.warning(POST_COMMIT_REFRESH_TOAST);
}

/** اگر خطای تازه‌سازی بعد از commit باشد هشدار می‌دهد و `true` برمی‌گرداند. */
export function notifyIfPostCommitRefreshFailure(error: unknown): boolean {
  if (!isPostCommitRefreshError(error)) return false;
  notifyPostCommitRefreshFailure();
  return true;
}
