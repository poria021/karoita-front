import type { NextConfig } from 'next';

function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      ...(apiUrl ? [apiUrl] : []),
      ...(isDev ? ['ws:', 'wss:', 'http://localhost:*'] : []),
    ],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
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
  { key: 'Content-Security-Policy', value: buildCsp() },
];

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    optimizePackageImports: [
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/react-fontawesome',
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

export default nextConfig;