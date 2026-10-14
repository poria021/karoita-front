/**
 * به‌روزرسانی `openapi.snapshot.json` از Swagger زندهٔ بک‌اند: `pnpm fake-api:sync`.
 * آدرس از `FAKE_NEST_DOCS_URL` (پیش‌فرض dev) می‌آید. بعد از اجرا `pnpm test` را بزنید؛
 * اگر بک‌اند مسیری را برداشته یا عوض کرده باشد، تست قرارداد همان‌جا می‌شکند.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_DOCS_URL = 'https://backenddev.darkube.ir/docs-json';

async function main(): Promise<void> {
  const url = process.env.FAKE_NEST_DOCS_URL || DEFAULT_DOCS_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`دریافت Swagger ناموفق بود (HTTP ${response.status}): ${url}`);
  }
  const doc = (await response.json()) as { paths?: Record<string, unknown> };
  const count = Object.keys(doc.paths ?? {}).length;
  if (count === 0) {
    throw new Error('Swagger دریافتی هیچ مسیری ندارد؛ snapshot عوض نشد.');
  }
  const target = path.join(__dirname, 'openapi.snapshot.json');
  writeFileSync(target, `${JSON.stringify(doc, null, 1)}\n`, 'utf8');
  console.info(`snapshot به‌روز شد: ${count} مسیر از ${url}`);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
