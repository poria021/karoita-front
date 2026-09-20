import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import type { NestLoginTokens } from '@/services/auth/real/nest-auth-mappers';
import {
  AuthSessionPersistError,
  clearRealAuthTokens,
  readRealAccessToken,
  readRealAuthSurface,
  writeRealAuthTokens,
} from '@/services/auth/real/real-auth.tokens';

const TOKENS: NestLoginTokens = {
  token: 'access-token-1',
  refreshToken: 'refresh-token-1',
  tokenExpires: Date.now() + 15 * 60 * 1000,
};

function fakeResponse(ok: boolean, status = ok ? 200 : 500): Response {
  return { ok, status } as unknown as Response;
}

function clearAllCookies(): void {
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

/**
 * رگرسیون: شکست بی‌صدای `set-tokens` ممنوع — retry گذرا، ۴xx فوری، شکست کامل → rollback و `AuthSessionPersistError`.
 */
describe('writeRealAuthTokens — set-tokens persistence', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    clearRealAuthTokens();
    clearAllCookies();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    clearRealAuthTokens();
    clearAllCookies();
    vi.unstubAllGlobals();
  });

  it('persists on the first attempt without retrying', async () => {
    fetchMock.mockResolvedValue(fakeResponse(true));

    await writeRealAuthTokens(TOKENS, 'user');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).toEqual({
      refreshToken: TOKENS.refreshToken,
      surface: 'user',
    });
    expect(body).not.toHaveProperty('accessToken');
    expect(readRealAccessToken()).toBe(TOKENS.token);
    expect(readRealAuthSurface()).toBe('user');
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
    expect(document.cookie).not.toContain('karvita_surface=');
  });

  it('persists admin surface in memory without a readable karvita_surface cookie', async () => {
    fetchMock.mockResolvedValue(fakeResponse(true));

    await writeRealAuthTokens(TOKENS, 'admin');

    expect(readRealAuthSurface()).toBe('admin');
    expect(document.cookie).not.toContain('karvita_surface=');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({ surface: 'admin' });
  });

  it('retries a transient network failure and succeeds on the second attempt', async () => {
    let call = 0;
    fetchMock.mockImplementation(async () => {
      call += 1;
      if (call === 1) throw new TypeError('network error');
      return fakeResponse(true);
    });

    await writeRealAuthTokens(TOKENS, 'user');

    expect(call).toBe(2);
    expect(readRealAccessToken()).toBe(TOKENS.token);
  }, 10_000);

  it('retries a transient 5xx and succeeds before exhausting attempts', async () => {
    let call = 0;
    fetchMock.mockImplementation(async () => {
      call += 1;
      if (call < 3) return fakeResponse(false, 503);
      return fakeResponse(true);
    });

    await writeRealAuthTokens(TOKENS, 'user');

    expect(call).toBe(3);
    expect(readRealAccessToken()).toBe(TOKENS.token);
  }, 10_000);

  it('does not retry a 4xx client error', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/auth/clear-tokens')) return fakeResponse(true);
      return fakeResponse(false, 400);
    });

    await expect(writeRealAuthTokens(TOKENS, 'user')).rejects.toThrow(
      AuthSessionPersistError
    );

    const setTokenCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes('/api/auth/set-tokens')
    );
    expect(setTokenCalls).toHaveLength(1);
  });

  it('rolls back the in-memory token and presence cookie when every attempt fails', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/auth/set-tokens')) {
        throw new TypeError('network down');
      }
      return fakeResponse(true); // `/api/auth/clear-tokens` بخشی از rollback
    });

    await expect(writeRealAuthTokens(TOKENS, 'user')).rejects.toThrow(
      'ورود کامل نشد'
    );

    // rollback نباید access در حافظه بدون کوکی رفرش باقی بگذارد
    expect(readRealAccessToken()).toBeNull();
    expect(document.cookie).not.toContain(`${AUTH_COOKIE_NAME}=1`);
  }, 10_000);

  it('does not clear a newer session when an older, superseded write later fails', async () => {
    const OLD_TOKENS: NestLoginTokens = {
      token: 'old-access',
      refreshToken: 'old-refresh',
      tokenExpires: Date.now() + 15 * 60 * 1000,
    };
    const NEW_TOKENS: NestLoginTokens = {
      token: 'new-access',
      refreshToken: 'new-refresh',
      tokenExpires: Date.now() + 15 * 60 * 1000,
    };

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/auth/set-tokens')) {
        const body = JSON.parse(String(init?.body)) as { refreshToken: string };
        // شبیه‌سازی رفرش پس‌زمینه‌ای که همیشه fail می‌شود (شبکه قطع)، درحالی‌که
        // لاگین/OTP جدید (توکن دیگر) بی‌درنگ موفق می‌شود.
        if (body.refreshToken === OLD_TOKENS.refreshToken) {
          throw new TypeError('network down');
        }
        return fakeResponse(true);
      }
      return fakeResponse(true); // clear-tokens، اگر صدا زده شود
    });

    // رفرش قدیمی شروع می‌شود ولی هنوز await نمی‌شود — اولین تلاشش pending می‌ماند.
    const staleWrite = writeRealAuthTokens(OLD_TOKENS, 'user');

    // بلافاصله یک سشن جدید (لاگین/OTP دیگر) موفق ثبت می‌شود.
    await writeRealAuthTokens(NEW_TOKENS, 'user');
    expect(readRealAccessToken()).toBe(NEW_TOKENS.token);

    // حالا رفرش قدیمی بعد از تمام تلاش‌ها fail می‌شود.
    await expect(staleWrite).rejects.toThrow('ورود کامل نشد');

    // سشن جدید نباید پاک شده باشد.
    expect(readRealAccessToken()).toBe(NEW_TOKENS.token);
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);

    const clearTokenCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes('/api/auth/clear-tokens')
    );
    expect(clearTokenCalls).toHaveLength(0);
  }, 10_000);
});
