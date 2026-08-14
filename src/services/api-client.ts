import ky, { HTTPError, type Options as KyOptions } from 'ky';

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
    const { readSessionMeta } = await import('@/services/auth/mock-auth.store');
    const meta = readSessionMeta();
    if (!meta?.token) return undefined;
    if (new Date(meta.expiresAt).getTime() <= Date.now()) return undefined;
    return meta.token;
  } catch {
    return undefined;
  }
}

function createClient() {
  if (!API_URL) {
    throw new ApiClientError('آدرس سرویس API پیکربندی نشده است.');
  }

  return ky.create({
    prefix: API_URL,
    credentials: 'include',
    hooks: {
      afterResponse: [
        async ({ response }) => {
          if (response.status === 401) {
            await handleUnauthorized();
          }
        },
      ],
    },
  });
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
    const client = createClient();
    const bearer = await resolveBearerToken(token);
    return await client[method](path.replace(/^\//, ''), {
      ...options,
      headers: { ...bearerHeaders(bearer), ...options.headers },
    }).json<T>();
  } catch (error) {
    return mapHttpError(error);
  }
}

/**
 * Shared Nest HTTP client (ky).
 * Credentials: cookie + optional Bearer (from arg or stored session meta).
 * 401 → clear session + bounce to login.
 */
export const apiClient = {
  getJson<T>(path: string, token?: string, options?: KyOptions): Promise<T> {
    return request<T>('get', path, { ...options }, token);
  },

  putJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T> {
    return request<T>(
      'put',
      path,
      {
        ...options,
        json: body,
      },
      token
    );
  },

  postJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T> {
    return request<T>(
      'post',
      path,
      {
        ...options,
        json: body,
      },
      token
    );
  },

  async postMaybeJson<T>(
    path: string,
    body: unknown,
    token?: string,
    options?: KyOptions
  ): Promise<T | null> {
    try {
      const client = createClient();
      const bearer = await resolveBearerToken(token);
      const response = await client.post(path.replace(/^\//, ''), {
        ...options,
        json: body,
        headers: { ...bearerHeaders(bearer), ...options?.headers },
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
  },

  async getMaybeJson<T>(
    path: string,
    token?: string,
    options?: KyOptions
  ): Promise<T | null> {
    try {
      const client = createClient();
      const bearer = await resolveBearerToken(token);
      const response = await client.get(path.replace(/^\//, ''), {
        ...options,
        headers: { ...bearerHeaders(bearer), ...options?.headers },
      });
      if (response.status === 204) return null;
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) return null;
      return (await response.json()) as T;
    } catch (error) {
      return mapHttpError(error);
    }
  },

  get baseUrl(): string {
    return API_URL;
  },

  get isConfigured(): boolean {
    return Boolean(API_URL);
  },
};
