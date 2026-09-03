import { createRequire } from 'node:module';
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

import { NEST_BROWSER_PROXY_PATH, NEST_LEGACY_BROWSER_PROXY_PATH } from './src/lib/nest-proxy';
import { PWA_OFFLINE_PATH } from './src/lib/pwa/pwa-cache-policy';
import { buildPwaRuntimeCaching } from './src/lib/pwa/pwa-workbox-runtime';
import { buildContentSecurityPolicy } from './src/lib/content-security-policy';

function withOptionalBundleAnalyzer(config: NextConfig): NextConfig {
  if (process.env.ANALYZE !== 'true') return config;
  const bundleAnalyzer = createRequire(import.meta.url)(
    '@next/bundle-analyzer'
  ) as (opts: { enabled: boolean }) => (c: NextConfig) => NextConfig;
  return bundleAnalyzer({ enabled: true })(config);
}

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  cacheStartUrl: false,
  dynamicStartUrl: true,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  fallbacks: {
    document: PWA_OFFLINE_PATH,
  },
  workboxOptions: {
    runtimeCaching: buildPwaRuntimeCaching(),
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    cacheId: 'karvita-20260903',
    // `inline: true` اسکریپت fallback را داخل `sw.js` می‌گذارد نه فایل جدا —
    // لینک preload اضافه از head حذف می‌شود و هشدار «preloaded but not used» می‌رود.
    inlineWorkboxRuntime: true,
    disableDevLogs: true,
  },
});

// CSP را یک‌بار در استارت نود بساز که `NODE_ENV` آنجا تضمینی است.
const csp = buildContentSecurityPolicy();

const nextConfig: NextConfig = {
  // ایمیج داکر فقط ردپای standalone را کپی می‌کند، نه کل node_modules.
  output: 'standalone',
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // لندر فقط-حضور بازنشسته. خانهٔ نقش داشبورد زنده است به‌علاوه
        // `KarvitaModuleAccessGuard` — این 307 را نگه دارید تا تب/بوکمارک قدیمی
        // داخل شِل 404 نشود.
        source: '/karvita/entry',
        destination: '/karvita/dashboard',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // مقصد Nest را اینجا hardcode نکن — URL روی Darkube موقع run می‌آید.
    // Route `/api/nest` همان را runtime پروکسی می‌کند. این فقط باندل قدیمی را نجات می‌دهد.
    return [
      {
        source: `${NEST_LEGACY_BROWSER_PROXY_PATH}/:path*`,
        destination: `${NEST_BROWSER_PROXY_PATH}/:path*`,
      },
    ];
  },
  experimental: {
    authInterrupts: true,
    optimizePackageImports: [
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/react-fontawesome',
      '@zxcvbn-ts/core',
      '@zxcvbn-ts/language-common',
      '@zxcvbn-ts/language-en',
      'browser-image-compression',
      'radix-ui',
      '@tanstack/react-query',
      'react-hook-form',
      'zod',
      'cmdk',
      'sonner',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
    ],
  },
};

export default withOptionalBundleAnalyzer(withPWA(nextConfig));
