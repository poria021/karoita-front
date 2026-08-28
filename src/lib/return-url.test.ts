import { describe, expect, it } from 'vitest';

import {
  RETURN_URL_PARAM,
  buildLoginHref,
  parseSafeReturnUrl,
} from '@/lib/return-url';

describe('parseSafeReturnUrl', () => {
  it('accepts relative app paths and search', () => {
    expect(parseSafeReturnUrl('/karvita/dashboard')).toBe('/karvita/dashboard');
    expect(parseSafeReturnUrl('/karvita/admin/organizational-structure?tab=cities')).toBe(
      '/karvita/admin/organizational-structure?tab=cities'
    );
  });

  it('rejects open redirects and auth loops', () => {
    expect(parseSafeReturnUrl('https://evil.example/phish')).toBeNull();
    expect(parseSafeReturnUrl('//evil.example')).toBeNull();
    expect(parseSafeReturnUrl('/\\evil.example')).toBeNull();
    expect(parseSafeReturnUrl('javascript:alert(1)')).toBeNull();
    expect(parseSafeReturnUrl('/auth/login')).toBeNull();
    expect(parseSafeReturnUrl('/auth/register')).toBeNull();
    expect(parseSafeReturnUrl('/auth/forgot')).toBeNull();
    expect(parseSafeReturnUrl('')).toBeNull();
    expect(parseSafeReturnUrl(null)).toBeNull();
  });

  it('decodes once and still rejects protocol-relative', () => {
    expect(parseSafeReturnUrl('%2F%2Fevil.example')).toBeNull();
  });
});

describe('buildLoginHref', () => {
  it('appends only validated returnUrl', () => {
    expect(buildLoginHref('/auth/login', '/karvita/dashboard')).toBe(
      `/auth/login?${RETURN_URL_PARAM}=%2Fkarvita%2Fdashboard`
    );
    expect(buildLoginHref('/auth/login', '//evil')).toBe('/auth/login');
  });
});
