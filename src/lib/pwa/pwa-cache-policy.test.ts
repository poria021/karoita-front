import { describe, expect, it } from 'vitest';

import {
  PWA_OFFLINE_PATH,
  shouldCacheStaticShell,
  shouldUseNetworkOnly,
} from '@/lib/pwa/pwa-cache-policy';

describe('shouldUseNetworkOnly', () => {
  it('blocks mutations and Nest/API/RSC/auth headers', () => {
    expect(
      shouldUseNetworkOnly({ method: 'POST', pathname: '/brand/x.png' })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/api/nest/v1/auth/login',
      })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({ method: 'GET', pathname: '/api/health' })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/karvita/dashboard',
        search: '?_rsc=1abc',
      })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/_next/data/build/karvita.json',
      })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/_next/static/chunks/app.js',
        headers: { authorization: 'Bearer x' },
      })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/karvita/dashboard',
        headers: { rsc: '1' },
      })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/karvita/dashboard',
        mode: 'navigate',
      })
    ).toBe(true);
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: PWA_OFFLINE_PATH,
        destination: 'document',
      })
    ).toBe(true);
  });

  it('allows hashed static shell GET without credentials', () => {
    expect(
      shouldUseNetworkOnly({
        method: 'GET',
        pathname: '/_next/static/chunks/app.js',
      })
    ).toBe(false);
  });
});

describe('shouldCacheStaticShell', () => {
  it('caches brand/marketing assets, not hashed Next chunks', () => {
    expect(
      shouldCacheStaticShell({
        method: 'GET',
        pathname: '/marketing/dashboard-hero.svg',
      })
    ).toBe(true);
    expect(
      shouldCacheStaticShell({
        method: 'GET',
        pathname: '/_next/static/chunks/app.js',
      })
    ).toBe(false);
    expect(
      shouldCacheStaticShell({
        method: 'GET',
        pathname: '/karvita/dashboard',
        mode: 'navigate',
      })
    ).toBe(false);
    expect(
      shouldCacheStaticShell({
        method: 'GET',
        pathname: '/api/nest/org',
      })
    ).toBe(false);
  });
});
