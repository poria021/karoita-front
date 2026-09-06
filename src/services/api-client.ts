/**
 * کلاینت HTTP مشترک Nest با ky. خطا در `api-error.ts`؛ توکن در `api-token.ts`.
 * هوک ۴۰۱ یک‌بار refresh می‌کند؛ `retry.limit` را کم نکن.
 */
import ky, { type Options as KyOptions } from 'ky';

import { NEST_BROWSER_PROXY_PATH, readNestApiBaseUrl } from '@/lib/nest-proxy';
import {
  decideUnauthorizedAfterResponse,
  KY_RETRY_LIMIT,
  KY_TIMEOUT_MS,
  resolveNestClientPrefix,
} from '@/services/api-client-config';
import { ApiClientError, mapHttpError } from '@/services/api-error';
import {
  bearerHeaders,
  handleUnauthorized,
  resolveBearerToken,
  rotateRealAccessToken,
} from '@/services/api-token';

export { ApiClientError, localizeApiError } from '@/services/api-error';

function publicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
}

/** Nest با `x-custom-lang` locale پیام را می‌گیرد؛ از locale مرورگر نگیر — محصول فارسی است. */
const NEST_LANG_HEADER = { 'x-custom-lang': 'fa' } as const;

let browserClient: ReturnType<typeof ky.create> | null = null;
let browserClientPrefix: string | null = null;

/** مرورگر از `/api/nest` می‌رود تا CORS دامنهٔ Nest بلاک نکند. */
function resolveClientPrefix(): string {
  if (typeof window === 'undefined') {
    return resolveNestClientPrefix({ apiUrl: readNestApiBaseUrl() });
  }
  return resolveNestClientPrefix({
    apiUrl: publicApiUrl(),
    windowOrigin: window.location.origin,
  });
}

function createKyClient(prefix: string) {
  return ky.create({
    prefix,
    credentials: 'include',
    timeout: KY_TIMEOUT_MS,
    // ky فقط با retry.limit>0 از request کلون می‌گیرد؛ limit را 0 نکن وگرنه POST بعد از 401 بدون بدنه می‌رود.
    retry: { limit: KY_RETRY_LIMIT },
    hooks: {
      afterResponse: [
        async ({ request, response, retryCount }) => {
          const action = decideUnauthorizedAfterResponse({
            status: response.status,
            retryCount,
            url: request.url,
          });
          if (action === 'ignore') {
            // ۴۰۱ بعد از refresh موفق: session معتبر است ولی permission ندارد.
            // پیام backend («نشست منقضی شد») گمراه‌کننده است؛ خطای واضح‌تری بده.
            if (response.status === 401) {
              throw new ApiClientError('دسترسی کافی ندارید.', 403);
            }
            return;
          }
          if (action === 'logout') {
            await handleUnauthorized();
            return;
          }
          const token = await rotateRealAccessToken();
          if (!token) {
            await handleUnauthorized();
            return;
          }
          const headers = new Headers(request.headers);
          headers.set('Authorization', `Bearer ${token}`);
          return ky.retry({
            request: new Request(request, { headers }),
            code: 'TOKEN_REFRESHED',
          });
        },
      ],
    },
  });
}

/** مرورگر یک instance ky نگه می‌دارد؛ SSR هر بار جدا تا cookie/هوک قاطی نشود. */
function getOrCreateClient() {
  const prefix = resolveClientPrefix();

  if (typeof window === 'undefined') {
    return createKyClient(prefix);
  }

  if (!browserClient || browserClientPrefix !== prefix) {
    browserClientPrefix = prefix;
    browserClient = createKyClient(prefix);
  }

  return browserClient;
}

async function request<T>(
  method: 'get' | 'put' | 'post' | 'patch' | 'delete',
  path: string,
  options: KyOptions = {},
  token?: string
): Promise<T> {
  try {
    const client = getOrCreateClient();
    const bearer = await resolveBearerToken(token);
    return await client[method](path.replace(/^\//, ''), {
      ...options,
      headers: { ...bearerHeaders(bearer), ...NEST_LANG_HEADER, ...options.headers },
    }).json<T>();
  } catch (error) {
    return mapHttpError(error);
  }
}

async function requestMaybeJson<T>(
  method: 'get' | 'put' | 'post' | 'patch' | 'delete',
  path: string,
  options: KyOptions = {},
  token?: string
): Promise<T | null> {
  try {
    const client = getOrCreateClient();
    const bearer = await resolveBearerToken(token);
    const response = await client[method](path.replace(/^\//, ''), {
      ...options,
      headers: { ...bearerHeaders(bearer), ...NEST_LANG_HEADER, ...options.headers },
    });
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return null;
    const text = await response.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch (error) {
    return mapHttpError(error);
  }
}

/** کلاینت Nest: cookie + Bearer اختیاری؛ ۴۰۱ → یک‌بار refresh، بعد logout. */
export const apiClient = {
  getJson<T>(path: string, token?: string, options?: KyOptions): Promise<T> {
    return request<T>('get', path, options ?? {}, token);
  },

  getMaybeJson<T>(path: string, token?: string, options?: KyOptions): Promise<T | null> {
    return requestMaybeJson<T>('get', path, options ?? {}, token);
  },

  postJson<T>(path: string, body: unknown, token?: string, options?: KyOptions): Promise<T> {
    return request<T>('post', path, { ...options, json: body }, token);
  },

  postMaybeJson<T>(path: string, body: unknown, token?: string, options?: KyOptions): Promise<T | null> {
    return requestMaybeJson<T>('post', path, { ...options, json: body }, token);
  },

  putJson<T>(path: string, body: unknown, token?: string, options?: KyOptions): Promise<T> {
    return request<T>('put', path, { ...options, json: body }, token);
  },

  putMaybeJson<T>(path: string, body: unknown, token?: string, options?: KyOptions): Promise<T | null> {
    return requestMaybeJson<T>('put', path, { ...options, json: body }, token);
  },

  patchJson<T>(path: string, body: unknown, token?: string, options?: KyOptions): Promise<T> {
    return request<T>('patch', path, { ...options, json: body }, token);
  },

  patchMaybeJson<T>(path: string, body: unknown, token?: string, options?: KyOptions): Promise<T | null> {
    return requestMaybeJson<T>('patch', path, { ...options, json: body }, token);
  },

  deleteMaybeJson<T>(path: string, token?: string, options?: KyOptions): Promise<T | null> {
    return requestMaybeJson<T>('delete', path, options ?? {}, token);
  },

  get baseUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${NEST_BROWSER_PROXY_PATH}`;
    }
    return readNestApiBaseUrl();
  },

  get isConfigured(): boolean {
    if (typeof window !== 'undefined') return true;
    return Boolean(readNestApiBaseUrl());
  },
};
