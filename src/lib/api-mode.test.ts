import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  assertMockApiMode,
  assertRealModeRejectsMockSecret,
  isMockApiMode,
  isRealApiMode,
  MOCK_MODE_LABEL,
  REAL_MODE_NOT_IMPLEMENTED,
  resolveApiMode,
  throwRealModeNotImplemented,
} from '@/lib/api-mode';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveApiMode', () => {
  it('defaults to mock in development when unset', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', '');
    expect(resolveApiMode()).toBe('mock');
    expect(isMockApiMode()).toBe(true);
  });

  it('defaults to real in production when unset', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', '');
    expect(resolveApiMode()).toBe('real');
    expect(isRealApiMode()).toBe(true);
  });

  it('respects explicit real in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(resolveApiMode()).toBe('real');
  });

  it('fail-closes when mock is set in production (NODE_ENV)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    expect(() => resolveApiMode()).toThrow(MOCK_MODE_LABEL);
  });

  it('rejects invalid NEXT_PUBLIC_API_MODE values', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'staging');
    expect(() => resolveApiMode()).toThrow(/نامعتبر/);
  });
});

describe('assertMockApiMode / mock secrets in real', () => {
  it('assertMockApiMode throws outside mock', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(() => assertMockApiMode()).toThrow(MOCK_MODE_LABEL);
  });

  it('assertRealModeRejectsMockSecret rejects fixed mock OTP in real', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(() =>
      assertRealModeRejectsMockSecret('12345', '12345', 'OTP')
    ).toThrow(/real/);
  });

  it('assertRealModeRejectsMockSecret is a no-op in mock', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    expect(() =>
      assertRealModeRejectsMockSecret('12345', '12345', 'OTP')
    ).not.toThrow();
  });

  it('throwRealModeNotImplemented uses the shared Persian message', () => {
    expect(() => throwRealModeNotImplemented('TestFacade.method')).toThrow(
      REAL_MODE_NOT_IMPLEMENTED
    );
  });
});

describe('isRealApiMode fail-closed in dev and production', () => {
  it('real + production is fail-closed', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(isRealApiMode()).toBe(true);
  });

  it('real + local dev is also fail-closed (no mock fallback)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(isRealApiMode()).toBe(true);
  });

  it('mock mode is not real', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    expect(isRealApiMode()).toBe(false);
  });
});
