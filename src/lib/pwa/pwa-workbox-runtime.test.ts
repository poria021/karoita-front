import { describe, expect, it } from 'vitest';

import { buildPwaRuntimeCaching } from '@/lib/pwa/pwa-workbox-runtime';

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
