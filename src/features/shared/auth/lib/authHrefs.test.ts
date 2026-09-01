import { describe, expect, it } from 'vitest';

import { RETURN_URL_PARAM } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

import {
  authCardSurfaceFromPathname,
  forgotHref,
  loginHref,
  registerHref,
} from './authHrefs';

describe('buildPublicAuthHref', () => {
  it('keeps a safe returnUrl and drops auth-loop targets', () => {
    expect(loginHref()).toBe(RouteService.auth.login());
    expect(loginHref({ returnUrl: '/karvita/dashboard' })).toBe(
      `${RouteService.auth.login()}?${RETURN_URL_PARAM}=%2Fkarvita%2Fdashboard`
    );
    expect(loginHref({ returnUrl: '/auth/register' })).toBe(
      RouteService.auth.login()
    );
  });

  it('builds register and forgot the same way', () => {
    expect(registerHref()).toBe(RouteService.auth.register());
    expect(forgotHref({ returnUrl: '/karvita/dashboard' })).toBe(
      `${RouteService.auth.forgot()}?${RETURN_URL_PARAM}=%2Fkarvita%2Fdashboard`
    );
  });
});

describe('authCardSurfaceFromPathname', () => {
  it('maps public auth paths and falls back to login', () => {
    expect(authCardSurfaceFromPathname(RouteService.auth.login())).toBe(
      'login'
    );
    expect(authCardSurfaceFromPathname(RouteService.auth.register())).toBe(
      'register'
    );
    expect(authCardSurfaceFromPathname(RouteService.auth.forgot())).toBe(
      'forgot'
    );
    expect(authCardSurfaceFromPathname('/auth/unknown')).toBe('login');
  });
});
