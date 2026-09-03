import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';
import { ApiClientError } from '@/services/api-error';
import { shouldSkipTokenRefresh } from '@/services/api-token';

/** ky فقط با retry.limit>0 از request کلون می‌گیرد؛ این عدد را عوض نکن. */
export const KY_RETRY_LIMIT = 1;

/**
 * timeout JSON/Nest؛ آپلود S3 جداست — این را بالا نبر تا شبکهٔ بد UI را hang نکند.
 */
export const KY_TIMEOUT_MS = 20_000;

export type UnauthorizedAfterResponseAction = 'ignore' | 'logout' | 'refresh';

/** تصمیم هوک afterResponse — بدون ky، تا قرارداد 401 در real تست‌پذیر بماند. */
export function decideUnauthorizedAfterResponse(input: {
  status: number;
  retryCount: number;
  url: string;
}): UnauthorizedAfterResponseAction {
  if (input.status !== 401) return 'ignore';
  if (input.retryCount > 0 || shouldSkipTokenRefresh(input.url)) {
    return 'logout';
  }
  return 'refresh';
}

/**
 * مرورگر از `/api/nest` می‌رود (حتی اگر URL نست در باندل خالی باشد).
 * SSR همان آدرس Nest سمت سرور است.
 */
export function resolveNestClientPrefix(input: {
  apiUrl: string;
  windowOrigin?: string;
}): string {
  if (input.windowOrigin) {
    if (!input.apiUrl) {
      return `${input.windowOrigin}${NEST_BROWSER_PROXY_PATH}`;
    }
    try {
      const origin = new URL(input.apiUrl).origin;
      if (origin !== input.windowOrigin) {
        return `${input.windowOrigin}${NEST_BROWSER_PROXY_PATH}`;
      }
    } catch {
      return `${input.windowOrigin}${NEST_BROWSER_PROXY_PATH}`;
    }
    return input.apiUrl;
  }
  if (!input.apiUrl) {
    throw new ApiClientError('آدرس سرویس API پیکربندی نشده است.');
  }
  return input.apiUrl;
}
