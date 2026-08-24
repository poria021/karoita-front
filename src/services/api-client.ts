/**
 * Shared Nest HTTP client (ky).
 * Responsible for: client creation, request dispatch, 401 retry hook.
 *
 * Error mapping → api-error.ts
 * Token lifecycle → api-token.ts
 */
import ky, { type Options as KyOptions } from 'ky';

import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';
import { ApiClientError, mapHttpError } from '@/services/api-error';
import {
  bearerHeaders,
  handleUnauthorized,
  resolveBearerToken,
  rotateRealAccessToken,
  shouldSkipTokenRefresh,
} from '@/services/api-token';

export { ApiClientError, localizeApiError } from '@/services/api-error';

// ─── Configuration ────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

// ─── Client factory ───────────────────────────────────────────────────────────

let browserClient: ReturnType<typeof ky.create> | null = null;
let browserClientPrefix: string | null = null;

/**
 * Browser calls go through Next rewrite (`/__nest-api`) so CORS on the
 * backend domain does not block cross-origin requests.
 */
function resolveClientPrefix(): string {
  if (!API_URL) {
    throw new ApiClientError('آدرس سرویس API پیکربندی نشده است.');
  }
  if (typeof window === 'undefined') return API_URL;
  try {
    const origin = new URL(API_URL).origin;
    if (origin !== window.location.origin) {
      return `${window.location.origin}${NEST_BROWSER_PROXY_PATH}`;
    }
  } catch {
    return API_URL;
  }
  return API_URL;
}

function createKyClient(prefix: string) {
  return ky.create({
    prefix,
    credentials: 'include',
    timeout: 30_000,
    retry: { limit: 1 },
    hooks: {
      afterResponse: [
        async ({ request, response, retryCount }) => {
          if (response.status !== 401) return;
          if (retryCount > 0 || shouldSkipTokenRefresh(request.url)) {
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

/**
 * Browser: reuse one ky instance (avoids redundant hook registrations).
 * SSR/streaming: new instance per call so requests do not share cookies/hooks.
 */
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

// ─── Request helpers ──────────────────────────────────────────────────────────

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
      headers: { ...bearerHeaders(bearer), ...options.headers },
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
      headers: { ...bearerHeaders(bearer), ...options.headers },
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

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Shared Nest HTTP client.
 * Credentials: cookie + optional Bearer. 401 → refresh once, then logout.
 */
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
    return API_URL;
  },

  get isConfigured(): boolean {
    return Boolean(API_URL);
  },
};
