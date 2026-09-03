import { describe, expect, it } from 'vitest';

import {
  accessTokenFromRefreshPayload,
  echoedAuthSurface,
  extractRotatedRefreshToken,
  isAuthSurface,
  NEST_REFRESH_PATHS,
  NEST_SESSION_PATHS,
  resolveAuthSurface,
} from '@/services/auth/real/refresh-route-helpers';

describe('refresh route Nest payload contract', () => {
  it('routes admin surface to admin Nest paths, everything else to user', () => {
    expect(resolveAuthSurface('admin')).toBe('admin');
    expect(resolveAuthSurface('user')).toBe('user');
    expect(resolveAuthSurface(undefined)).toBe('user');
    expect(resolveAuthSurface('nope')).toBe('user');
    expect(isAuthSurface('admin')).toBe(true);
    expect(isAuthSurface('user')).toBe(true);
    expect(isAuthSurface(undefined)).toBe(false);
    expect(isAuthSurface('nope')).toBe(false);

    expect(NEST_REFRESH_PATHS.admin).toBe('v1/admin/auth/refresh');
    expect(NEST_REFRESH_PATHS.user).toBe('v1/auth/refresh');
    expect(NEST_SESSION_PATHS.admin).toBe('v1/admin/auth/me');
    expect(NEST_SESSION_PATHS.user).toBe('v1/auth/me');
  });

  it('reads refreshToken from both flat and nested Nest envelopes', () => {
    expect(
      extractRotatedRefreshToken({
        token: 'a',
        refreshToken: 'rt-flat',
      })
    ).toBe('rt-flat');
    expect(
      extractRotatedRefreshToken({
        data: { token: 'a', refreshToken: 'rt-nested' },
      })
    ).toBe('rt-nested');
    expect(extractRotatedRefreshToken({ token: 'a' })).toBeNull();
    expect(extractRotatedRefreshToken(null)).toBeNull();
  });

  it('reads access token from both envelopes', () => {
    expect(accessTokenFromRefreshPayload({ token: 'access-1' })).toBe(
      'access-1'
    );
    expect(
      accessTokenFromRefreshPayload({ data: { token: 'access-2' } })
    ).toBe('access-2');
  });

  it('reads echoed surface from the refresh JSON, not by guessing user', () => {
    expect(echoedAuthSurface({ token: 'a', surface: 'admin' })).toBe('admin');
    expect(echoedAuthSurface({ token: 'a', surface: 'user' })).toBe('user');
    expect(echoedAuthSurface({ token: 'a' })).toBeNull();
    expect(echoedAuthSurface(null)).toBeNull();
  });
});
