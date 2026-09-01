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
 * تشخیص development در Node و Edge. در Edge مقدار `NODE_ENV` قابل اعتماد نیست؛
 * `NEXT_PUBLIC_IS_DEV` در بیلد اینلاین می‌شود. فقط در `.env.local` بگذارید، نه production.
 */
function isDevEnvironment(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  // Edge/کلاینت: `NEXT_PUBLIC_IS_DEV` در بیلد اینلاین می‌شود.
  if (process.env.NEXT_PUBLIC_IS_DEV === 'true') return true;
  return false;
}

/**
 * CSP سند. App Router اسکریپت hydration اینلاین می‌سازد؛ بدون `'unsafe-inline'`
 * (یا nonce) سند بعد از paint خالی می‌ماند. `'unsafe-eval'` فقط برای Turbopack HMR
 * در development است. `'wasm-unsafe-eval'` برای `@zxcvbn-ts/core` در هر دو محیط لازم است
 * و فقط کامپایل WebAssembly از ArrayBuffer را مجاز می‌کند، نه ارزیابی رشته.
 */
export function buildContentSecurityPolicy(): string {
  const isDev = isDevEnvironment();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const apiOrigin = originFromEnv(process.env.NEXT_PUBLIC_API_URL);
  // origin آپلود مستقیم روی signed URL (S3/MinIO)
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
      // `@zxcvbn-ts/core` در هر دو محیط WebAssembly می‌خواهد؛ با `unsafe-eval` فرق دارد.
      "'wasm-unsafe-eval'",
      // Turbopack HMR فقط در development به `unsafe-eval` نیاز دارد.
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    // hydration از `<script>` است نه `onclick=`؛ بدون nonce که سند را خالی می‌کند.
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
      // websocket HMR و API محلی در development
      ...(isDev ? ['ws://localhost:*', 'wss://localhost:*', 'http://localhost:*'] : []),
    ],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    // workbox از blob URL برای worker استفاده می‌کند
    'worker-src': ["'self'", 'blob:'],
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
