import { sentryConnectOriginsFromEnv } from './observability/parseSentryDsn';

function originFromEnv(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Detect development mode in a way that works in ALL Next.js runtimes:
 *   - Node.js (API routes, Server Components) → process.env.NODE_ENV works
 *   - Edge Runtime (middleware/proxy.ts)       → process.env.NODE_ENV is
 *     unreliable; we fall back to the NEXT_PUBLIC_IS_DEV variable which is
 *     inlined at build time and available everywhere including Edge.
 *
 * NEXT_PUBLIC_IS_DEV=true must be set in .env.local (never .env.production).
 */
function isDevEnvironment(): boolean {
  // Primary: NODE_ENV (works in Node.js runtime)
  if (process.env.NODE_ENV === 'development') return true;
  // Fallback: NEXT_PUBLIC_IS_DEV (works in Edge runtime & client)
  if (process.env.NEXT_PUBLIC_IS_DEV === 'true') return true;
  return false;
}

/**
 * Document CSP. Next App Router emits inline hydration/Flight scripts, so
 * production must allow `'unsafe-inline'` (or a per-request nonce). Blocking
 * those scripts leaves a blank document after paint.
 *
 * In development, Turbopack requires both `'unsafe-eval'` and
 * `'wasm-unsafe-eval'` for HMR and module evaluation. These are intentionally
 * excluded from production where they pose a real security risk.
 */
export function buildContentSecurityPolicy(): string {
  const isDev = isDevEnvironment();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const apiOrigin = originFromEnv(process.env.NEXT_PUBLIC_API_URL);
  // S3/MinIO presigned URL origin — برای آپلود مستقیم فایل روی signed URL
  const s3Origin = originFromEnv(process.env.NEXT_PUBLIC_S3_URL);

  const webhookOrigin = originFromEnv(process.env.NEXT_PUBLIC_ERROR_WEBHOOK_URL);
  const analyticsOrigin = originFromEnv(
    process.env.NEXT_PUBLIC_ANALYTICS_BEACON_URL
  );

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      // Turbopack (dev) needs unsafe-eval + wasm-unsafe-eval for HMR.
      // Both are intentionally blocked in production.
      ...(isDev ? ["'unsafe-eval'", "'wasm-unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      ...(apiUrl ? [apiUrl] : []),
      ...(apiOrigin ? [apiOrigin] : []),
      ...(s3Origin ? [s3Origin] : []),
      ...sentryConnectOriginsFromEnv(),
      ...(webhookOrigin ? [webhookOrigin] : []),
      ...(analyticsOrigin ? [analyticsOrigin] : []),
      // HMR websocket + local API connections in development
      ...(isDev ? ['ws://localhost:*', 'wss://localhost:*', 'http://localhost:*'] : []),
    ],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}
