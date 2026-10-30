import { afterEach, describe, expect, it, vi } from 'vitest';

const realRefreshToken = vi.fn();
const readRealAccessToken = vi.fn(() => null as string | null);

vi.mock('@/services/auth/real/real-auth.bridge', () => ({
  realRefreshToken: (...args: unknown[]) => realRefreshToken(...args),
}));

vi.mock('@/services/auth/real/real-auth.tokens', () => ({
  readRealAccessToken: () => readRealAccessToken(),
}));

import {
  resolveBearerToken,
  rotateRealAccessToken,
  shouldSkipTokenRefresh,
} from '@/services/api-token';

describe('shouldSkipTokenRefresh', () => {
  it('skips the actual bootstrap endpoints (login/refresh/logout)', () => {
    expect(shouldSkipTokenRefresh('/api/nest/v1/auth/refresh')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/nest/v1/auth/phone/login/password')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/nest/v1/auth/logout')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/nest/v1/admin/auth/refresh')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/nest/v1/admin/auth/phone/login/verify-otp')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/auth/refresh')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/auth/set-tokens')).toBe(true);
  });

  it('does NOT skip session-check endpoints — regression test for the admin logout-loop bug', () => {
    // قبلاً کل `/v1/admin/auth/` استثنا بود؛ ۴۰۱ روی `me` refresh نمی‌گرفت و ادمین logout می‌شد.
    expect(shouldSkipTokenRefresh('/api/nest/v1/admin/auth/me')).toBe(false);
    expect(shouldSkipTokenRefresh('/api/nest/v1/auth/me')).toBe(false);
  });

  it('does not skip ordinary resource endpoints', () => {
    expect(shouldSkipTokenRefresh('/api/nest/v1/admin/users')).toBe(false);
    expect(shouldSkipTokenRefresh('/api/nest/v1/notifications')).toBe(false);
  });
});

describe('resolveBearerToken — in-flight rotate', () => {
  afterEach(() => {
    realRefreshToken.mockReset();
    readRealAccessToken.mockReset();
    readRealAccessToken.mockReturnValue(null);
  });

  it('awaits an in-flight keep-alive rotate instead of returning a stale empty token', async () => {
    let resolveRefresh!: (session: { token: string } | null) => void;
    let releaseRefresh!: () => void;
    const refreshReady = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    realRefreshToken.mockImplementation(
      () =>
        new Promise<{ token: string } | null>((resolve) => {
          resolveRefresh = resolve;
          releaseRefresh();
        })
    );

    const rotatePromise = rotateRealAccessToken();
    const bearerPromise = resolveBearerToken();

    await refreshReady;
    resolveRefresh({ token: 'warm-access' });

    await expect(rotatePromise).resolves.toBe('warm-access');
    await expect(bearerPromise).resolves.toBe('warm-access');
  });

  it('returns an explicit token without starting a rotate', async () => {
    await expect(resolveBearerToken('explicit-token')).resolves.toBe(
      'explicit-token'
    );
    expect(realRefreshToken).not.toHaveBeenCalled();
  });
});
