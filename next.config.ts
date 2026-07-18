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
