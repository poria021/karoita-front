/**
 * GET /favicon.ico
 *
 * مرورگرها فارغ از تگ‌های <link rel="icon"> که در `metadata.icons` (نگاه کن
 * به src/app/layout.tsx) تعریف شده‌اند، همیشه یک درخواست مجزا و سخت‌کدشده
 * برای مسیر /favicon.ico می‌فرستند. همان مارک برند (`karvita-mark.png`) را
 * می‌دهیم — پس‌زمینه شفاف، بدون آیکون PWA سفید.
 *
 * پوشه‌ای با نام «favicon.ico» حاوی route.ts، قرارداد رسمی App Router برای
 * ست‌کردن Route Handler روی مسیرهایی با نقطه در نامشان است.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { NextResponse } from 'next/server';

const FAVICON_SOURCE = join(process.cwd(), 'public', 'brand', 'karvita-mark.png');

export async function GET() {
  const file = await readFile(FAVICON_SOURCE);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
