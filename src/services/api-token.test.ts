import { describe, expect, it } from 'vitest';

import { shouldSkipTokenRefresh } from '@/services/api-token';

describe('shouldSkipTokenRefresh', () => {
  it('skips the actual bootstrap endpoints (login/refresh/logout)', () => {
    expect(shouldSkipTokenRefresh('/__nest-api/v1/auth/refresh')).toBe(true);
    expect(shouldSkipTokenRefresh('/__nest-api/v1/auth/phone/login/password')).toBe(true);
    expect(shouldSkipTokenRefresh('/__nest-api/v1/auth/logout')).toBe(true);
    expect(shouldSkipTokenRefresh('/__nest-api/v1/admin/auth/refresh')).toBe(true);
    expect(shouldSkipTokenRefresh('/__nest-api/v1/admin/auth/phone/login/verify-otp')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/auth/refresh')).toBe(true);
    expect(shouldSkipTokenRefresh('/api/auth/set-tokens')).toBe(true);
  });

  it('does NOT skip session-check endpoints — regression test for the admin logout-loop bug', () => {
    // این دقیقاً همون باگی بود که رگرشن‌تست‌اش این‌جاست: قبلاً کل namespace
    // `/v1/admin/auth/` استثنا شده بود، پس 401 روی `me` هرگز refresh
    // نمی‌گرفت و کاربر ادمین با انقضای توکن مستقیم logout می‌شد.
    expect(shouldSkipTokenRefresh('/__nest-api/v1/admin/auth/me')).toBe(false);
    expect(shouldSkipTokenRefresh('/__nest-api/v1/auth/me')).toBe(false);
  });

  it('does not skip ordinary resource endpoints', () => {
    expect(shouldSkipTokenRefresh('/__nest-api/v1/admin/users')).toBe(false);
    expect(shouldSkipTokenRefresh('/__nest-api/v1/notifications')).toBe(false);
  });
});
