/**
 * تست‌های قرارداد شکست رفرش نشست — دو کلاس خرابی:
 *
 * الف) نشست مرده  (Dead)    → ۴۰۱/۴۰۳: clearRealAuthTokens، resolve به null
 * ب) خطای گذرا  (Transient) → ۵xx/شبکه: presence دست‌نخورده، throw SessionTransientError
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_COOKIE_NAME } from '@/lib/config';

const VALID_USER = {
  id: 'u-1',
  phone: '09121111111',
  firstName: 'Test',
  lastName: 'User',
  role: { id: 'role-1', name: 'student' },
  documentStatus: 'APPROVED',
};

const TOKEN_EXPIRES_MS = Date.now() + 15 * 60 * 1_000;

/**
 * یک پاسخ موفق refresh از Nest — شکل مطابق `looksLikeNestLoginResponse`:
 * نیاز به `token` (نه `accessToken`)، `refreshToken`، `tokenExpires`، و `user`.
 */
function makeSuccessBody() {
  return {
    token: 'access-1',
    refreshToken: 'refresh-1',
    tokenExpires: TOKEN_EXPIRES_MS,
    user: VALID_USER,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function clearAllCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0]?.trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

// -------------------------------------------------------------------

describe('performRealRefresh (از طریق realRefreshToken)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('fetch', fetchMock);
    clearAllCookies();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    clearAllCookies();
  });

  // ================================================================
  // الف: نشست مرده
  // ================================================================

  it('۴۰۱ از /api/auth/refresh → توکن‌ها و presence پاک می‌شوند و null برمی‌گردد', async () => {
    // set-tokens برای rollback پاسخ می‌دهد
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/clear-tokens')) return jsonResponse({});
      return jsonResponse({ error: 'expired' }, 401);
    });

    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );

    const result = await realRefreshToken();
    expect(result).toBeNull();
    // presence cookie باید پاک شده باشد
    expect(document.cookie).not.toContain(`${AUTH_COOKIE_NAME}=1`);
  });

  it('۴۰۳ از /api/auth/refresh → توکن‌ها و presence پاک می‌شوند و null برمی‌گردد', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/clear-tokens')) return jsonResponse({});
      return jsonResponse({ error: 'forbidden' }, 403);
    });

    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );

    const result = await realRefreshToken();
    expect(result).toBeNull();
    expect(document.cookie).not.toContain(`${AUTH_COOKIE_NAME}=1`);
  });

  // ================================================================
  // ب: خطای گذرا
  // ================================================================

  it('خطای شبکه (fetch throw) → SessionTransientError پرتاب می‌شود، presence دست‌نخورده', async () => {
    // presence را از پیش تنظیم کن (مثل حالت واقعی — cookie قبلاً ست شده)
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/`;

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/clear-tokens')) return jsonResponse({});
      if (url.includes('/api/auth/refresh')) {
        throw new TypeError('Failed to fetch');
      }
      return jsonResponse({});
    });

    const { realRefreshToken, SessionTransientError } = await import(
      '@/services/auth/real/real-auth.bridge'
    );

    await expect(realRefreshToken()).rejects.toBeInstanceOf(SessionTransientError);
    // presence دست‌نخورده
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
  });

  it('۵۰۲ از /api/auth/refresh → SessionTransientError پرتاب می‌شود، presence دست‌نخورده', async () => {
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/`;

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/clear-tokens')) return jsonResponse({});
      return jsonResponse({ error: 'gateway error' }, 502);
    });

    const { realRefreshToken, SessionTransientError } = await import(
      '@/services/auth/real/real-auth.bridge'
    );

    await expect(realRefreshToken()).rejects.toBeInstanceOf(SessionTransientError);
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
  });

  it('refreshRealSession روی ۵۰۲ به‌عنوان لاگین‌نشده resolve نمی‌شود و presence می‌ماند', async () => {
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/`;

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/clear-tokens')) return jsonResponse({});
      return jsonResponse({ error: 'gateway error' }, 502);
    });

    const { AuthService } = await import('@/services/auth.service');
    const { SessionTransientError } = await import(
      '@/services/auth/real/real-auth.bridge'
    );

    await expect(AuthService.refreshRealSession()).rejects.toBeInstanceOf(
      SessionTransientError
    );
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
  });

  it('۵۰۰ از /api/auth/refresh → SessionTransientError پرتاب می‌شود، presence دست‌نخورده', async () => {
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/`;

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/clear-tokens')) return jsonResponse({});
      return jsonResponse({ error: 'internal' }, 500);
    });

    const { realRefreshToken, SessionTransientError } = await import(
      '@/services/auth/real/real-auth.bridge'
    );

    await expect(realRefreshToken()).rejects.toBeInstanceOf(SessionTransientError);
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
  });

  // ================================================================
  // موفق — رگرسیون
  // ================================================================

  it('refresh موفق → Session برمی‌گرداند و presence ست می‌شود', async () => {
    // set-tokens httpOnly نیاز دارد — mock کن
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/set-tokens')) return jsonResponse({});
      if (url.includes('/api/auth/refresh')) return jsonResponse(makeSuccessBody());
      return jsonResponse({});
    });

    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const { readRealAuthSurface } = await import(
      '@/services/auth/real/real-auth.tokens'
    );

    const session = await realRefreshToken();
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe(VALID_USER.id);
    expect(readRealAuthSurface()).toBe('user');
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`);
    expect(document.cookie).not.toContain('karvita_surface=');
  });

  it('refresh موفق ادمین از حافظهٔ خالی → surface ادمین بدون حدس user', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/set-tokens')) return jsonResponse({});
      if (url.includes('/api/auth/refresh')) {
        return jsonResponse({
          token: 'access-admin',
          refreshToken: 'refresh-admin',
          tokenExpires: TOKEN_EXPIRES_MS,
          admin: {
            id: 'a-1',
            fname: 'Ad',
            lname: 'Min',
            phone: '09120000000',
            status: { name: 'active' },
          },
          surface: 'admin',
        });
      }
      return jsonResponse({});
    });

    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const { readRealAuthSurface } = await import(
      '@/services/auth/real/real-auth.tokens'
    );

    const session = await realRefreshToken();
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe('a-1');
    expect(readRealAuthSurface()).toBe('admin');
    const setTokenCall = fetchMock.mock.calls.find(([input]) =>
      String(input).includes('/api/auth/set-tokens')
    );
    expect(setTokenCall).toBeDefined();
    const body = JSON.parse(String((setTokenCall?.[1] as RequestInit).body));
    expect(body.surface).toBe('admin');
  });

  it('payload فقط-توکن بدون surface echo → user me زده نمی‌شود', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/set-tokens')) return jsonResponse({});
      if (url.includes('/api/auth/refresh')) {
        return jsonResponse({
          token: 'access-1',
          refreshToken: 'refresh-1',
          tokenExpires: TOKEN_EXPIRES_MS,
        });
      }
      return jsonResponse({});
    });

    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const { readRealAuthSurface } = await import(
      '@/services/auth/real/real-auth.tokens'
    );

    const session = await realRefreshToken();
    expect(session).toBeNull();
    expect(readRealAuthSurface()).toBeNull();
    const setTokenCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes('/api/auth/set-tokens')
    );
    expect(setTokenCalls).toHaveLength(0);
  });
});

// ================================================================
// رگرسیون: ۴۰۱ روی /auth/me بعد از داشتن access در حافظه
// ================================================================

describe('refreshRealSession — 401 روی /auth/me پس از access token در memory', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test');
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('fetch', fetchMock);
    clearAllCookies();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    clearAllCookies();
  });

  it('اگر /auth/me با 401 رد شود، session پاک و null برمی‌گردد', async () => {
    vi.useFakeTimers();

    // اول access token را با یک refresh موفق به حافظه بیاور
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/set-tokens')) return jsonResponse({});
      if (url.includes('/api/auth/refresh')) return jsonResponse(makeSuccessBody());
      return jsonResponse({});
    });

    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    await realRefreshToken();

    // زمان را از پنجره freshness عبور بده تا refreshRealSession به /auth/me برود
    vi.advanceTimersByTime(6 * 60_000);

    // حالا /auth/me را mock کن تا ApiClientError با ستاتوس 401 پرتاب کند
    const { AuthService } = await import('@/services/auth.service');
    const { apiClient, ApiClientError } = await import('@/services/api-client');

    vi.spyOn(apiClient, 'getJson').mockRejectedValue(
      new ApiClientError('نشست منقضی شده', 401)
    );

    const result = await AuthService.refreshRealSession();
    vi.useRealTimers();
    expect(result).toBeNull();
    expect(document.cookie).not.toContain(`${AUTH_COOKIE_NAME}=1`);
  });
});

describe('realSetPassword', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('POSTs oldPassword and newPassword to v1/auth/set/password', async () => {
    const { REAL_AUTH_PATHS, realSetPassword } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const { apiClient } = await import('@/services/api-client');
    const postMaybeJson = vi
      .spyOn(apiClient, 'postMaybeJson')
      .mockResolvedValue(null);

    expect(REAL_AUTH_PATHS.setPassword).toBe('v1/auth/set/password');
    await realSetPassword({
      oldPassword: '9192050927',
      newPassword: 'newPassword123',
    });

    expect(postMaybeJson).toHaveBeenCalledWith('v1/auth/set/password', {
      oldPassword: '9192050927',
      newPassword: 'newPassword123',
    });
    postMaybeJson.mockRestore();
  });
});
