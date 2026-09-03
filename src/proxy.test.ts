/**
 * تست‌های منطق Edge — بدون NextRequest واقعی:
 *
 * - `hasEdgeClientSession`: presence cookie را درست می‌خواند
 * - `isAuthPath` / `isAppShellPath`: مسیرها به‌درستی شناسایی می‌شوند
 *
 * این تست‌ها تأیید می‌کنند که قرارداد دو لایه (client bounce loop fix + Edge rule)
 * یکپارچه است. تست کامل E2E proxy نیاز به Node/Edge runtime دارد.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { AUTH_COOKIE_NAME } from '@/lib/config';

// -------------------------------------------------------------------
// hasEdgeClientSession
// -------------------------------------------------------------------

describe('hasEdgeClientSession', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function makeCookies(values: Record<string, string>) {
    return {
      get: (name: string) => {
        const v = values[name];
        return v !== undefined ? { value: v } : undefined;
      },
    };
  }

  it('با karvita_session=1 → loggedIn true', async () => {
    const { hasEdgeClientSession } = await import('@/lib/edge-session');
    expect(
      hasEdgeClientSession(makeCookies({ [AUTH_COOKIE_NAME]: '1' }))
    ).toBe(true);
  });

  it('بدون کوکی → loggedIn false', async () => {
    const { hasEdgeClientSession } = await import('@/lib/edge-session');
    expect(hasEdgeClientSession(makeCookies({}))).toBe(false);
  });

  it('کوکی خالی → loggedIn false (presence نیاز به مقدار دارد)', async () => {
    const { hasEdgeClientSession } = await import('@/lib/edge-session');
    expect(
      hasEdgeClientSession(makeCookies({ [AUTH_COOKIE_NAME]: '' }))
    ).toBe(false);
  });
});

// -------------------------------------------------------------------
// isAuthPath / isAppShellPath — منطق route classification
// -------------------------------------------------------------------

describe('route classification (Edge gate logic)', () => {
  it('/auth/login → isAuthPath', async () => {
    const { isAuthPath } = await import('@/services/route.service');
    expect(isAuthPath('/auth/login')).toBe(true);
    expect(isAuthPath('/auth/register')).toBe(true);
    expect(isAuthPath('/auth')).toBe(true);
  });

  it('/karvita/* → isAppShellPath', async () => {
    const { isAppShellPath } = await import('@/services/route.service');
    expect(isAppShellPath('/karvita/dashboard')).toBe(true);
    expect(isAppShellPath('/karvita/admin/users')).toBe(true);
    expect(isAppShellPath('/karvita')).toBe(true);
  });

  it('/auth/* → نه isAppShellPath', async () => {
    const { isAppShellPath } = await import('@/services/route.service');
    expect(isAppShellPath('/auth/login')).toBe(false);
  });

  it('/karvita/* → نه isAuthPath', async () => {
    const { isAuthPath } = await import('@/services/route.service');
    expect(isAuthPath('/karvita/dashboard')).toBe(false);
  });
});

// -------------------------------------------------------------------
// قرارداد دو لایه: توضیح منطق bounce loop
// -------------------------------------------------------------------

describe('bounce-loop contract — منطق ترکیبی Edge + Client', () => {
  /**
   * این تست‌ها قرارداد را به صورت unit تأیید می‌کنند:
   * Edge: loggedIn && isAuthPath → redirect to dashboard
   * Client: خطای گذرا → boot='error', نه 'unauthenticated', نه redirect به /auth/login
   *
   * نتیجه: اگر client هرگز به /auth/login redirect نکند (در خطای گذرا)،
   * Edge هرگز فرصت bounce ندارد — loop قطع می‌شود.
   */

  it('SessionTransientError → kind===transient و message دارد', async () => {
    const { SessionTransientError } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const err = new SessionTransientError('سرور در دسترس نیست', new TypeError('network'));
    expect(err.kind).toBe('transient');
    expect(err.message).toContain('سرور');
    expect(err instanceof Error).toBe(true);
    expect(err.name).toBe('SessionTransientError');
  });

  it('SessionDeadError → kind===dead', async () => {
    const { SessionDeadError } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const err = new SessionDeadError('نشست منقضی شد');
    expect(err.kind).toBe('dead');
    expect(err.name).toBe('SessionDeadError');
  });

  it('RuntimeAuthBoot شامل error است — sessionBoot state machine', async () => {
    const { setRuntimeAuthBoot, getRuntimeAuthBoot, resetRuntimeAuthBoot } =
      await import('@/store/sessionBoot');

    setRuntimeAuthBoot('error');
    expect(getRuntimeAuthBoot()).toBe('error');
    resetRuntimeAuthBoot();
    expect(getRuntimeAuthBoot()).toBeNull();
  });
});

describe('proxy() — Edge gate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('بدون نشست + /karvita/dashboard → لاگین + returnUrl', async () => {
    const { NextRequest } = await import('next/server');
    const { proxy } = await import('@/proxy');
    const request = new NextRequest('http://localhost:3000/karvita/dashboard');
    const response = await proxy(request);
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/auth/login');
    expect(location).toContain('returnUrl');
  });

  it('presence + /auth/login → داشبورد (کاربر واردشده به لاگین برنگردد)', async () => {
    const { NextRequest } = await import('next/server');
    const { proxy } = await import('@/proxy');
    const { AUTH_COOKIE_NAME: cookieName } = await import('@/lib/config');
    const request = new NextRequest('http://localhost:3000/auth/login', {
      headers: { cookie: `${cookieName}=1` },
    });
    const response = await proxy(request);
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/karvita/dashboard');
  });
});
