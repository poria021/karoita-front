import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildContentSecurityPolicy } from '@/lib/content-security-policy';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildContentSecurityPolicy', () => {
  it('allows inline scripts required by Next.js App Router hydration', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("worker-src 'self'");
  });

  it('blocks inline event-handler attributes without removing hydration scripts', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });

  it('does not add unsafe-eval in production even if NEXT_PUBLIC_IS_DEV is true', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_IS_DEV', 'true');
    const csp = buildContentSecurityPolicy();
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('allows Turbopack HMR eval and local websocket origins in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws://localhost:*');
    expect(csp).toContain('ws://127.0.0.1:*');
    expect(csp).toContain('ws://[::1]:*');
  });
});
