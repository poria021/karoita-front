/**
 * پروکسی هم‌مبدا مرورگر تا CORS نست را نبندد.
 * با `_` شروع نشود — در App Router پوشهٔ `_` route نیست و روی سرور ۴۰۴ می‌شود.
 */
export const NEST_BROWSER_PROXY_PATH = '/api/nest';

/** باندل/PWA قدیمی هنوز این مسیر را می‌زند؛ rewrite به `/api/nest` می‌رود. */
export const NEST_LEGACY_BROWSER_PROXY_PATH = '/__nest-api';

function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

/**
 * خواندن env بدون اینلاین Next.
 * `process.env.NEXT_PUBLIC_*` موقع بیلد با رشتهٔ خالی عوض می‌شود؛ دسترسی پویا نه.
 */
function readRuntimeEnv(name: string): string {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * آدرس Nest روی سرور. ترتیب: internal، سپس NEST_API_URL، سپس NEXT_PUBLIC در runtime پاد.
 */
export function readNestApiBaseUrl(): string {
  for (const key of [
    'BACKEND_INTERNAL_URL',
    'NEST_API_URL',
    'NEXT_PUBLIC_API_URL',
  ] as const) {
    const value = readRuntimeEnv(key);
    if (value) return trimSlash(value);
  }
  return '';
}
