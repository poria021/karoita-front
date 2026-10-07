import { afterEach, describe, expect, it, vi } from 'vitest';

import { AUTH_COOKIE_NAME, MOCK_SESSION_MARKER } from '@/lib/config';
import {
  hasEdgeClientSession,
  shouldHonorMockSessionMarker,
} from '@/lib/edge-session';

afterEach(() => {
  vi.unstubAllEnvs();
});

function cookies(
  entries: Record<string, string>
): Parameters<typeof hasEdgeClientSession>[0] {
  return {
    get: (name: string) => {
      const value = entries[name];
      return value === undefined ? undefined : { value };
    },
  };
}

describe('shouldHonorMockSessionMarker', () => {
  it('در حالت real هرگز marker را نمی‌پذیرد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_IS_DEV', 'true');
    expect(shouldHonorMockSessionMarker()).toBe(false);
  });

  it('در mock صریح marker را می‌پذیرد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    expect(shouldHonorMockSessionMarker()).toBe(true);
  });

  it('در production با mode خالی fail-closed است', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', '');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_IS_DEV', '');
    expect(shouldHonorMockSessionMarker()).toBe(false);
  });

  it('در production پرچم لوکال IS_DEV را نادیده می‌گیرد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', '');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_IS_DEV', 'true');
    expect(shouldHonorMockSessionMarker()).toBe(false);
  });

  it('در development با mode خالی (پیش‌فرض mock) می‌پذیرد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', '');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_IS_DEV', '');
    expect(shouldHonorMockSessionMarker()).toBe(true);
  });
});

describe('hasEdgeClientSession', () => {
  it('cookie واقعی نشست را همیشه می‌پذیرد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.stubEnv('NODE_ENV', 'production');
    expect(
      hasEdgeClientSession(cookies({ [AUTH_COOKIE_NAME]: '1' }))
    ).toBe(true);
  });

  it('در real، marker شبیه‌ساز را نشست حساب نمی‌کند', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.stubEnv('NODE_ENV', 'production');
    expect(
      hasEdgeClientSession(cookies({ [MOCK_SESSION_MARKER]: '1' }))
    ).toBe(false);
  });

  it('در mock، marker شبیه‌ساز را نشست حساب می‌کند', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    expect(
      hasEdgeClientSession(cookies({ [MOCK_SESSION_MARKER]: '1' }))
    ).toBe(true);
  });
});
