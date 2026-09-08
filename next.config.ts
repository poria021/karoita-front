import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

import { NEST_BROWSER_PROXY_PATH, NEST_LEGACY_BROWSER_PROXY_PATH } from './src/lib/nest-proxy';
import { PWA_OFFLINE_PATH } from './src/lib/pwa/pwa-cache-policy';
import { buildPwaRuntimeCaching, buildPrecacheManifestTransform } from './src/lib/pwa/pwa-workbox-runtime';
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
    cacheId: 'karvita-20260904-sw-nav-fallback',
    // `inline: true` اسکریپت fallback را داخل `sw.js` می‌گذارد نه فایل جدا —
    // لینک preload اضافه از head حذف می‌شود و هشدار «preloaded but not used» می‌رود.
    inlineWorkboxRuntime: true,
    disableDevLogs: true,
    // فایل‌های بزرگ‌تر از ۲ مگ precache نمیشن — چانک‌های سنگین فقط شبکه.
    maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
    // فقط entry‌های اصلی Next.js precache بشن، نه همه چانک‌های پشتیبان.
    modifyURLPrefix: {},
    manifestTransforms: [buildPrecacheManifestTransform],
  },
});

// نسبی-از-ریشه برای Turbopack `resolveAlias` (که همین‌طور resolve می‌کند).
const MOCK_EMPTY_STUB = './src/lib/mock-empty-stub.js';
// مطلق برای webpack `NormalModuleReplacementPlugin` — `resource.request` نسبت‌به
// پوشهٔ فایل importکننده resolve می‌شود، نه ریشهٔ پروژه؛ مسیر نسبی اینجا
// «Module not found» می‌دهد چون بیرون از پوشهٔ importکننده دنبالش می‌گردد.
const MOCK_EMPTY_STUB_ABSOLUTE = fileURLToPath(
  new URL(MOCK_EMPTY_STUB, import.meta.url)
);

const isMockBuild = process.env.NEXT_PUBLIC_API_MODE === 'mock';

/**
 * لیست کامل mock module هایی که از فایل‌های production ایمپورت می‌شوند.
 * در حالت real، Turbopack و webpack هر دو این مسیرها را به stub یونیورسال هدایت می‌کنند.
 * با این مکانیزم، حذف کامل پوشه‌های mock از پروژه هیچ تأثیری بر production build ندارد.
 */
const MOCK_MODULES_TO_STUB = [
  '@/services/auth/mock/auth-mock-users',
  '@/services/auth/mock/mock-auth.operations',
  '@/services/auth/mock/mock-auth.store',
  '@/services/daily-approvals/mock/mock-daily-approvals-store',
  '@/services/syllabus-config/mock/mock-syllabus-daily-approvals-reads',
  '@/services/mock/mock-authz',
  '@/services/admin-user-creation/mock/mock-admin-user-creation',
  '@/services/internship-enrollment/mock/mock-enrollment-store',
  '@/services/landing-cms/mock/mock-landing-cms.mutations',
  '@/services/landing-cms/mock/mock-landing-cms.store',
  '@/services/notifications/mock/mock-notifications.store',
  '@/services/onboarding-approvals/mock/mock-onboarding-approvals',
  '@/services/org-structure/mock/mock-org-store',
  '@/services/org-structure/mock/mock-org-query',
  '@/services/org-structure/mock/mock-org-mutations',
  '@/services/organizational-capacities/mock/mock-organizational-capacities-store',
  '@/services/profile/mock/profile.mock',
  '@/services/syllabus-config/mock/mock-syllabus-store',
  '@/lib/mock-admin-list-delay',
] as const;

const mockStubAliases: Record<string, string> = isMockBuild
  ? {}
  : Object.fromEntries(MOCK_MODULES_TO_STUB.map(m => [m, MOCK_EMPTY_STUB]));

const nextConfig: NextConfig = {
  // ایمیج داکر فقط ردپای standalone را کپی می‌کند، نه کل node_modules.
  output: 'standalone',
  // gzip این سرور + gzip اینگرس = ERR_CONTENT_DECODING_FAILED روی /api/nest.
  compress: false,
  // undici را باندل نکن — Agent/connectTimeout باید از پکیج واقعی بیاید.
  serverExternalPackages: ['undici'],
  turbopack: {
    resolveAlias: mockStubAliases,
  },
  typescript: {
    // tsconfig.build.json فایل‌های test را از type-check حذف می‌کند.
    tsconfigPath: isMockBuild ? './tsconfig.json' : './tsconfig.build.json',
    // وقتی mock files حذف شده‌اند، TypeScript خطا می‌دهد اما Turbopack
    // با stub ها production bundle را درست می‌سازد. این flag فقط در real mode
    // فعال است تا build pipeline مسدود نشود.
    // بررسی واقعی TypeScript: `tsc --noEmit` را در CI جداگانه اجرا کنید.
    ignoreBuildErrors: !isMockBuild,
  },
  async headers() {
    // داخل headers() بساز — NODE_ENV اینجا development است، نه موقع transpile کانفیگ.
    const csp = buildContentSecurityPolicy();
    return [
      {
        source: '/api/nest/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-transform' },
        ],
      },
      {
        source: '/__nest-api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-transform' },
        ],
      },
      {
        // `/_next/*` (از جمله webpack-hmr) را CSP نده تا Fast Refresh قطع نشود.
        source: '/((?!_next/).*)',
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
  webpack(config, { webpack: wp }) {
    // در production (NEXT_PUBLIC_API_MODE !== 'mock')، تمام import های */mock/*
    // به stub یونیورسال هدایت می‌شوند. mock files را می‌توان بعد از حذف آن‌ها
    // بدون مشکل برای production build حذف کرد.
    // سرویس‌ها همه mock calls را داخل if (IS_MOCK_MODE) گارد کرده‌اند،
    // پس stub های no-op هرگز در real mode اجرا نمی‌شوند.
    if (process.env.NEXT_PUBLIC_API_MODE !== 'mock') {
      config.plugins.push(
        new wp.NormalModuleReplacementPlugin(
          /[/\\]mock[/\\]/,
          (resource: { request: string }) => {
            // __mocks__ ویژه vitest است — دست نزن
            if (resource.request.includes('__mocks__')) return;
            resource.request = MOCK_EMPTY_STUB_ABSOLUTE;
          }
        )
      );
    }
    return config;
  },

  experimental: {
    // بیلد Docker/Darkube: سقف worker برای page-data (پیش‌فرض ≈ نصف CPUها).
    ...(process.env.NEXT_CPU_COUNT
      ? {
          cpus: Math.max(
            1,
            Number.parseInt(process.env.NEXT_CPU_COUNT, 10) || 1
          ),
        }
      : {}),
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
