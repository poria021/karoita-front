import type { NextConfig } from 'next';

/**
 * Conservative browser security headers (rule 45).
 * CSP intentionally omitted until a verified allowlist for Kv / Font Awesome /
 * Next assets exists — a brittle CSP would break auth/dashboard chrome.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  /** Mitigate some cross-origin window attacks; allow same-origin popups if needed later. */
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  /**
   * Turbopack on Next <16.3 kept unbounded in-memory route caches and could OOM
   * long `next dev` sessions. 16.3+ can evict after FS snapshots — prefer full
   * reclaim on this large app so Windows/dev agents stay under pressure.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackMemoryEviction
   */
  experimental: {
    turbopackMemoryEviction: 'full',
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

export default nextConfig;
