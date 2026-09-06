import type { PluginOptions } from '@ducanh2912/next-pwa';

type PwaRuntimeCaching = NonNullable<
  NonNullable<PluginOptions['workboxOptions']>['runtimeCaching']
>;

type WorkboxRuntimePlugin = NonNullable<
  NonNullable<PwaRuntimeCaching[number]['options']>['plugins']
>[number];

/**
 * NetworkOnly بدون catch، FetchEvent را `no-response` reject می‌کند
 * (سند داشبورد و `/api/nest` هر دو). `self.fallback` را next-pwa تزریق می‌کند.
 * تابع باید خودکفا بماند تا GenerateSW بتواند سریالش کند.
 */
function networkOnlyErrorPlugin(): WorkboxRuntimePlugin {
  return {
    handlerDidError: async ({ request }) => {
      const fallback = (
        self as typeof self & {
          fallback?: (req: Request) => Promise<Response | undefined>;
        }
      ).fallback;
      if (typeof fallback === 'function') {
        const response = await fallback(request);
        if (response) return response;
      }
      return new Response('', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'cache-control': 'no-store' },
      });
    },
  };
}

/**
 * مسیرهای runtime ورکباکس. توابع matcher باید خودکفا باشند تا `GenerateSW`
 * بتواند آن‌ها را داخل worker سریال کند (بدون closure ماژول). بررسی مسیر را با
 * `pwa-cache-policy.ts` هم‌تراز نگه دارید.
 */
function networkOnlyOnError() {
  return { plugins: [networkOnlyErrorPlugin()] };
}

/**
 * فقط entry‌های ضروری Next.js precache بشن:
 * - فایل‌های `/_next/static/` با پسوند JS/CSS که در مسیر اصلی باشن
 * - تصاویر و فونت‌های داخل `/_next/static/media/`
 * چانک‌های lazy که نامشان با `chunks/` شروع میشه و بزرگ‌اند، فیلتر میشن.
 *
 * این تابع باید در `next.config.ts` ایمپورت بشه (جایی که node context داریم).
 */
const PRECACHE_SKIP_PATTERNS = [
  // چانک‌های lazy-loaded — فقط وقتی لازم باشن از شبکه میان
  /\/_next\/static\/chunks\/pages\//,
  /\/_next\/static\/chunks\/app\//,
  // source maps
  /\.map$/,
  // webpack hot-update
  /\.hot-update\./,
];

/**
 * از precache manifest، چانک‌های lazy و فایل‌های غیرضروری رو حذف می‌کنه.
 * با `manifestTransforms` در workboxOptions ست میشه.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildPrecacheManifestTransform(entries: any[]): { manifest: any[] } {
  return {
    manifest: entries.filter(
      (e: { url: string }) => !PRECACHE_SKIP_PATTERNS.some((re) => re.test(e.url))
    ),
  };
}

export function buildPwaRuntimeCaching(): PwaRuntimeCaching {
  return [
    {
      urlPattern: ({ request }) => {
        const method = request.method.toUpperCase();
        return method !== 'GET' && method !== 'HEAD';
      },
      handler: 'NetworkOnly',
      options: networkOnlyOnError(),
    },
    {
      urlPattern: ({ request }) =>
        request.mode === 'navigate' || request.destination === 'document',
      handler: 'NetworkOnly',
      options: networkOnlyOnError(),
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
      options: networkOnlyOnError(),
    },
    {
      urlPattern: ({ url, request }) => {
        const method = request.method.toUpperCase();
        if (method !== 'GET' && method !== 'HEAD') return false;
        return /^(?:\/brand\/|\/fonts\/|\/marketing\/)/.test(url.pathname);
      },
      handler: 'CacheFirst',
      options: {
        cacheName: 'karvita-static-shell-v2',
        expiration: {
          maxEntries: 96,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ];
}
