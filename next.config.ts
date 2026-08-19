import { createRequire } from 'node:module';
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

import { NEST_BROWSER_PROXY_PATH } from './src/lib/nest-proxy';
import { buildContentSecurityPolicy } from './src/lib/content-security-policy';
import { PWA_OFFLINE_PATH } from './src/lib/pwa/pwa-cache-policy';
import { buildPwaRuntimeCaching } from './src/lib/pwa/pwa-workbox-runtime';

function withOptionalBundleAnalyzer(config: NextConfig): NextConfig {
  if (process.env.ANALYZE !== 'true') return config;
  const bundleAnalyzer = createRequire(import.meta.url)(
    '@next/bundle-analyzer'
  ) as (opts: { enabled: boolean }) => (c: NextConfig) => NextConfig;
  return bundleAnalyzer({ enabled: true })(config);
}

/**
 * Conservative browser security headers (rule 45).
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
];

const nestProxyDestination = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

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
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  async rewrites() {
    if (!nestProxyDestination?.startsWith('http')) return [];
    return [
      {
        source: `${NEST_BROWSER_PROXY_PATH}/:path*`,
        destination: `${nestProxyDestination}/:path*`,
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withOptionalBundleAnalyzer(withPWA(nextConfig));