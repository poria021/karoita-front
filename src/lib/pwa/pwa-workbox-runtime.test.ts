import { describe, expect, it } from 'vitest';

import { buildPrecacheManifestTransform, buildPwaRuntimeCaching } from '@/lib/pwa/pwa-workbox-runtime';

describe('buildPwaRuntimeCaching', () => {
  it('gives NetworkOnly document and API routes a catch so FetchEvent does not reject', () => {
    const routes = buildPwaRuntimeCaching();
    const networkOnly = routes.filter((route) => route.handler === 'NetworkOnly');
    expect(networkOnly.length).toBeGreaterThanOrEqual(3);
    for (const route of networkOnly) {
      const plugins = route.options?.plugins ?? [];
      expect(plugins.length).toBeGreaterThan(0);
      expect(
        plugins.some(
          (plugin) =>
            plugin &&
            typeof plugin === 'object' &&
            'handlerDidError' in plugin &&
            typeof plugin.handlerDidError === 'function'
        )
      ).toBe(true);
    }
  });
});

describe('buildPrecacheManifestTransform', () => {
  it('removes generic app chunks from precache', () => {
    const entries = [
      { url: '/_next/static/chunks/app/dashboard/page-abc123.js', revision: '1' },
      { url: '/_next/static/chunks/pages/_app-abc123.js', revision: '1' },
      { url: '/_next/static/css/main.css', revision: '1' },
    ];
    const { manifest } = buildPrecacheManifestTransform(entries);
    expect(manifest).toHaveLength(1);
    expect(manifest[0].url).toBe('/_next/static/css/main.css');
  });

  it('keeps offline page chunk in precache even though it is under chunks/app/', () => {
    const entries = [
      { url: '/_next/static/chunks/app/(marketing)/offline/page-abc123.js', revision: '1' },
      { url: '/_next/static/chunks/app/dashboard/page-xyz.js', revision: '1' },
    ];
    const { manifest } = buildPrecacheManifestTransform(entries);
    expect(manifest).toHaveLength(1);
    expect(manifest[0].url).toContain('offline');
  });
});
