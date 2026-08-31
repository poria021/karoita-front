import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';
import { ApiClientError } from '@/services/api-error';
import { shouldSkipTokenRefresh } from '@/services/api-token';

/**
 * ky فقط وقتی limit > 0 باشد request را clone می‌کند تا هوک 401
 * بتواند POST/PATCH را با بدنه دوباره بزند. این عدد را عوض نکنید.
 */
export const KY_RETRY_LIMIT = 1;

/**
 * timeout پیش‌فرض ky (AbortController داخلی). آپلود فایل روی S3 جداست
 * و timeout بلندتری دارد — این عدد را برای JSON/Nest نگه می‌داریم تا
 * شبکهٔ بد UI را ۳۰ ثانیه hang نکند.
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
 * Browser روی origin دیگر از `/__nest-api` می‌رود؛ SSR همان NEXT_PUBLIC_API_URL.
 */
export function resolveNestClientPrefix(input: {
  apiUrl: string;
  windowOrigin?: string;
}): string {
  if (!input.apiUrl) {
    throw new ApiClientError('آدرس سرویس API پیکربندی نشده است.');
  }
  if (!input.windowOrigin) return input.apiUrl;
  try {
    const origin = new URL(input.apiUrl).origin;
    if (origin !== input.windowOrigin) {
      return `${input.windowOrigin}${NEST_BROWSER_PROXY_PATH}`;
    }
  } catch {
    return input.apiUrl;
  }
  return input.apiUrl;
}
