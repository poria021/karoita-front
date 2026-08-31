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
 *
 * @zxcvbn-ts/core uses WebAssembly internally — `'wasm-unsafe-eval'` is required
 * in both dev and production for the password strength indicator to work.
 * This is safe: wasm-unsafe-eval only allows WebAssembly compilation from
 * ArrayBuffers, NOT arbitrary string evaluation like `unsafe-eval` does.
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
      // wasm-unsafe-eval: لازم برای @zxcvbn-ts/core (WebAssembly) در هر دو محیط.
      // این با unsafe-eval فرق دارد — فقط ArrayBuffer های wasm رو مجاز می‌کنه،
      // نه ارزیابی رشته‌های دلخواه. خطرپذیری پایین است.
      "'wasm-unsafe-eval'",
      // unsafe-eval فقط در development برای Turbopack HMR لازمه.
      // در production هرگز فعال نمی‌شه.
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    // Next hydration از <script> استفاده می‌کند نه onclick=؛ بستن attr XSS
    // رایج را بدون nonce (که سند را خالی می‌کند) محدود می‌کند.
    'script-src-attr': ["'none'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', ...(isDev ? ['http:'] : [])],
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
    // blob: برای workbox service worker که از blob URLs استفاده می‌کنه
    'worker-src': ["'self'", 'blob:'],
    // Service worker و workbox نیاز به دسترسی به static assets دارن
    'script-src-elem': [
      "'self'",
      "'unsafe-inline'",
      "'wasm-unsafe-eval'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}
