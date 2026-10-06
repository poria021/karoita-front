/**
 * کانفیگ زمان اجرا (runtime) برای سوییچ mock/real بدون بیلد دوباره.
 *
 * `NEXT_PUBLIC_*` موقع بیلد در باندل اینلاین می‌شود و بعدش عوض نمی‌شود. برای اینکه
 * یک ایمیج روی Darkube فقط با تغییر env پاد بین mock و real سوییچ شود:
 *
 * - سرور (Node، شامل `proxy.ts`): با دسترسی پویا `process.env[name]` می‌خواند
 *   (دسترسی پویا اینلاین نمی‌شود).
 * - مرورگر: `/runtime-config.js` (route داینامیک) قبل از باندل‌ها
 *   `window.__KV_RUNTIME__` را می‌گذارد؛ اگر نبود، مقدار اینلاین‌شدهٔ بیلد.
 *
 * نام‌های runtime: `APP_API_MODE`، `APP_ALLOW_MOCK_IN_PROD`؛ در غیابشان
 * `NEXT_PUBLIC_API_MODE` / `NEXT_PUBLIC_ALLOW_MOCK_IN_PROD` (سازگاری با قبل).
 */

export interface KvRuntimeConfig {
  apiMode?: string;
  allowMockInProd?: boolean;
}

declare global {
  interface Window {
    __KV_RUNTIME__?: KvRuntimeConfig;
  }
}

function readServerEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** مقدار خام حالت API (lowercase)؛ `undefined` اگر هیچ‌جا ست نشده. */
export function readRuntimeApiMode(): string | undefined {
  if (isBrowser()) {
    const fromWindow = window.__KV_RUNTIME__?.apiMode?.trim().toLowerCase();
    if (fromWindow) return fromWindow;
    // دسترسی ایستا عمدی است — مقدار زمان بیلد.
    return process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase() || undefined;
  }
  return (
    (
      readServerEnv('APP_API_MODE') ?? readServerEnv('NEXT_PUBLIC_API_MODE')
    )?.toLowerCase() || undefined
  );
}

export function readRuntimeAllowMockInProd(): boolean {
  if (isBrowser()) {
    const fromWindow = window.__KV_RUNTIME__?.allowMockInProd;
    if (typeof fromWindow === 'boolean') return fromWindow;
    return process.env.NEXT_PUBLIC_ALLOW_MOCK_IN_PROD === 'true';
  }
  const raw =
    readServerEnv('APP_ALLOW_MOCK_IN_PROD') ??
    readServerEnv('NEXT_PUBLIC_ALLOW_MOCK_IN_PROD');
  return raw?.toLowerCase() === 'true';
}

/** فقط سمت سرور؛ بدنهٔ `/runtime-config.js`. */
export function buildRuntimeConfig(): KvRuntimeConfig {
  return {
    apiMode: readRuntimeApiMode(),
    allowMockInProd: readRuntimeAllowMockInProd(),
  };
}
