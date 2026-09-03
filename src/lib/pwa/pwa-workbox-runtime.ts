import type { PluginOptions } from '@ducanh2912/next-pwa';

type PwaRuntimeCaching = NonNullable<
  NonNullable<PluginOptions['workboxOptions']>['runtimeCaching']
>;

/**
 * مسیرهای runtime ورکباکس. توابع matcher باید خودکفا باشند تا `GenerateSW`
 * بتواند آن‌ها را داخل worker سریال کند (بدون closure ماژول). بررسی مسیر را با
 * `pwa-cache-policy.ts` هم‌تراز نگه دارید.
 */
export function buildPwaRuntimeCaching(): PwaRuntimeCaching {
  return [
    {
      urlPattern: ({ request }) => {
        const method = request.method.toUpperCase();
        return method !== 'GET' && method !== 'HEAD';
      },
      handler: 'NetworkOnly',
    },
    {
      urlPattern: ({ request }) =>
        request.mode === 'navigate' || request.destination === 'document',
      handler: 'NetworkOnly',
    },
    {
      urlPattern: ({ url, request }) => {
        const path = url.pathname;
        const search = url.search;
        if (path === '/sw.js' || path.startsWith('/workbox-')) return true;
        if (path.startsWith('/swe-worker')) return true;
        if (path.startsWith('/api/nest')) return true;
        if (path.startsWith('/__nest-api')) return true;
        if (path === '/api' || path.startsWith('/api/')) return true;
        if (path.includes('/_next/data/')) return true;
        if (/(?:^|[?&])_rsc=/.test(search)) return true;
        if (request.headers.get('authorization')) return true;
        if (request.headers.get('rsc')) return true;
        if (request.headers.get('next-router-state-tree')) return true;
        if (request.headers.get('next-url')) return true;
        return false;
      },
      handler: 'NetworkOnly',
    },
    {
      urlPattern: ({ url, request }) => {
        const method = request.method.toUpperCase();
        if (method !== 'GET' && method !== 'HEAD') return false;
        return /^(?:\/_next\/static\/|\/brand\/|\/fonts\/|\/marketing\/)/.test(
          url.pathname
        );
      },
      handler: 'CacheFirst',
      options: {
        cacheName: 'karvita-static-shell',
        expiration: {
          maxEntries: 96,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ];
}
