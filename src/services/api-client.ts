import ky, { HTTPError, NetworkError, TimeoutError, type Options as KyOptions } from 'ky';

import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';
import { isAuthPath, RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';


const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly payload?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractApiMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.message === 'string') return payload.message;
  if (Array.isArray(payload.message)) {
    const messages = payload.message.filter(
      (message): message is string => typeof message === 'string'
    );
    return messages.length > 0 ? messages.join('، ') : null;
  }
  if (Array.isArray(payload.errors)) {
    const messages = payload.errors
      .flatMap((entry) => {
        if (typeof entry === 'string') return [entry];
        if (isRecord(entry) && typeof entry.message === 'string') {
          return [entry.message];
        }
        return [];
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join('، ') : null;
  }
  if (isRecord(payload.errors)) {
    const mapped = Object.entries(payload.errors)
      .map(([key, value]) => {
        if (typeof value !== 'string') return null;
        const lower = value.toLowerCase();
        // Nest reuses `hash` as the OTP/reset-token field (see real-auth.bridge.ts).
        // An invalid/expired OTP on verify-otp comes back as a 404 with
        // `{ errors: { hash: 'invalidOtp.' } }` — without this check it fell
        // through to the generic 404 message ('منبع درخواستی یافت نشد.'),
        // which reads like a broken route instead of a wrong code.
        if (key.toLowerCase() === 'hash' || /invalid.?otp/i.test(value)) {
          return 'کد تایید وارد‌شده اشتباه یا منقضی شده است.';
        }
        if (lower === 'notfound' || lower.includes('not found')) {
          return 'کاربری با این شماره یافت نشد.';
        }
        if (/phone/i.test(value) || /11-digit/i.test(value)) {
          return 'فرمت شماره موبایل معتبر نیست.';
        }
        return isPersianMessage(value) ? value : null;
      })
      .filter((value): value is string => Boolean(value));
    if (mapped.length > 0) return mapped.join('، ');
  }
  return typeof payload.error === 'string' ? payload.error : null;
}

function isPersianMessage(message: string): boolean {
  return /[\u0600-\u06FF]/.test(message);
}

function defaultStatusMessage(status: number): string {
  if (status === 400) {
    return 'اطلاعات ارسال‌شده معتبر نیست. لطفاً فیلدها را بررسی کنید.';
  }
  if (status === 401) return 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.';
  if (status === 403) return 'شما اجازه انجام این عملیات را ندارید.';
  if (status === 404) return 'منبع درخواستی یافت نشد.';
  if (status === 409) return 'اطلاعات با داده‌های موجود تداخل دارد.';
  if (status === 413) return 'حجم فایل ارسالی بیش از حد مجاز است.';
  if (status === 422) {
    return 'اطلاعات ارسال‌شده معتبر نیست. شماره موبایل یا رمز را بررسی کنید.';
  }
  if (status >= 500) {
    return 'سرویس موقتاً در دسترس نیست. لطفاً کمی بعد تلاش کنید.';
  }
  return 'انجام عملیات با خطا مواجه شد.';
}

export function localizeApiError(payload: unknown, status: number): string {
  const serverMessage = extractApiMessage(payload);
  return serverMessage && isPersianMessage(serverMessage)
    ? serverMessage
    : defaultStatusMessage(status);
}

let handlingUnauthorized = false;
let browserRotateAccessPromise: Promise<string | null> | null = null;
let browserClient: ReturnType<typeof ky.create> | null = null;
let browserClientPrefix: string | null = null;

const AUTH_BOOTSTRAP_PATH =
  /(\/v1\/auth\/(refresh|logout|phone\/login|phone\/register|forgot|reset)|\/admin\/auth\/)(?:\/|$|\?)/;

function shouldSkipTokenRefresh(url: string): boolean {
  return AUTH_BOOTSTRAP_PATH.test(url);
}

async function rotateAccessTokenOnce(): Promise<string | null> {
  try {
    const { readRealRefreshToken } = await import(
      '@/services/auth/real-auth.tokens'
    );
    const refresh = readRealRefreshToken();
    if (!refresh) return null;
    const { realRefreshToken } = await import(
      '@/services/auth/real-auth.bridge'
    );
    const session = await realRefreshToken(refresh);
    return session?.token ?? null;
  } catch {
    return null;
  }
}

async function rotateRealAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return rotateAccessTokenOnce();
  }
  if (browserRotateAccessPromise) return browserRotateAccessPromise;

  browserRotateAccessPromise = rotateAccessTokenOnce().finally(() => {
    browserRotateAccessPromise = null;
  });

  return browserRotateAccessPromise;
}

async function handleUnauthorized(): Promise<void> {
  if (handlingUnauthorized || typeof window === 'undefined') return;

  if (isAuthPath(window.location.pathname)) {
    useUserStore.getState().setUser(null);
    return;
  }

  handlingUnauthorized = true;
  try {
    useUserStore.getState().setUser(null);
    const { AuthService } = await import('@/services/auth.service');
    await AuthService.logout().catch(() => undefined);
    if (!isAuthPath(window.location.pathname)) {
      window.location.assign(RouteService.auth.login());
    }
  } finally {
    handlingUnauthorized = false;
  }
}

function bearerHeaders(token?: string): HeadersInit {
  if (!token) return {};
  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  };
}

async function resolveBearerToken(explicit?: string): Promise<string | undefined> {
  if (explicit) return explicit;
  try {
    const { readRealAccessToken, readRealRefreshToken } = await import(
      '@/services/auth/real-auth.tokens'
    );
    const access = readRealAccessToken();
    if (access) return access;
    if (!readRealRefreshToken()) return undefined;
    return (await rotateRealAccessToken()) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Browser calls go through Next rewrite (`/__nest-api`) so CORS on
 * backenddev.darkube.ir does not block register GET /auth/roles.
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
 * Browser: reuse one ky instance.
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

async function mapHttpError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    let payload: unknown = null;
    try {
      payload = await error.response.json();
    } catch {
      payload = null;
    }
    throw new ApiClientError(
      localizeApiError(payload, error.response.status),
      error.response.status,
      payload
    );
  }

  if (error instanceof ApiClientError) throw error;

  if (error instanceof NetworkError || error instanceof TimeoutError) {
    throw new ApiClientError(
      'ارتباط با سرویس احراز هویت برقرار نشد. اگر همین صفحه را تازه ری‌استارت کرده‌اید، چند ثانیه صبر کنید و دوباره تلاش کنید.'
    );
  }

  if (error instanceof TypeError) {
    throw new ApiClientError(
      'ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کنید.'
    );
  }

  throw new ApiClientError(
    error instanceof Error && error.message
      ? error.message
      : 'خطایی غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.'
  );
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

/**
 * Shared Nest HTTP client (ky).
 * Credentials: cookie + optional Bearer. 401 → refresh once, then logout.
 */
export const apiClient = {
  getJson<T>(path: string, token?: string, options?: KyOptions): Promise<T> {
    return request<T>('get', path, options ?? {}, token);
  },

  putJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T> {
    return request<T>('put', path, { ...options, json: body }, token);
  },

  postJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T> {
    return request<T>('post', path, { ...options, json: body }, token);
  },

  patchJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T> {
    return request<T>('patch', path, { ...options, json: body }, token);
  },

  patchMaybeJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T | null> {
    return requestMaybeJson<T>(
      'patch',
      path,
      { ...options, json: body },
      token
    );
  },

  deleteMaybeJson<T>(
    path: string,
    token?: string,
    options?: KyOptions
  ): Promise<T | null> {
    return requestMaybeJson<T>('delete', path, options ?? {}, token);
  },

  async postMaybeJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T | null> {
    return requestMaybeJson<T>(
      'post',
      path,
      { ...options, json: body },
      token
    );
  },

  getMaybeJson<T>(
    path: string,
    token?: string,
    options?: KyOptions
  ): Promise<T | null> {
    return requestMaybeJson<T>('get', path, options ?? {}, token);
  },

  get baseUrl(): string {
    return API_URL;
  },

  get isConfigured(): boolean {
    return Boolean(API_URL);
  },
};