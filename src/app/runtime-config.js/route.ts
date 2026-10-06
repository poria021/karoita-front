import { buildRuntimeConfig } from '@/lib/runtime-config';

// هر درخواست از env پاد می‌خواند؛ هرگز در بیلد ثابت نشود.
export const dynamic = 'force-dynamic';

/**
 * اسکریپت همزمان داخل `<head>`: قبل از باندل‌ها `window.__KV_RUNTIME__` را می‌گذارد
 * تا `IS_MOCK_MODE` و هم‌خانواده‌ها در مرورگر همان حالت سرور را ببینند.
 * فقط مقادیر غیرمحرمانه (حالت API) — هیچ secret ای اینجا نباید بیاید.
 */
export function GET() {
  const body = `window.__KV_RUNTIME__=${JSON.stringify(buildRuntimeConfig())};`;
  return new Response(body, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  });
}
