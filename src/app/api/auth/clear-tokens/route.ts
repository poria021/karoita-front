/**
 * `POST /api/auth/clear-tokens` — پاک کردن کوکی رفرش/surface.
 * روی logout و ۴۰۱ قطعی بعد از refresh ناموفق.
 */
import { NextResponse, type NextRequest } from 'next/server';

import {
  LEGACY_ACCESS_COOKIE_NAME,
  REAL_REFRESH_COOKIE_NAME,
  REAL_SURFACE_COOKIE_NAME,
} from '@/lib/real-auth-cookie';
import { assertSameOriginPost } from '@/lib/auth-origin-guard';

export async function POST(request: NextRequest) {
  // CSRF: کوکی رفرش را پاک می‌کند؛ فقط same-origin تا سایت متقاطع logout اجباری نکند.
  const guard = assertSameOriginPost(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.reason }, { status: guard.status });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REAL_REFRESH_COOKIE_NAME);
  response.cookies.delete(LEGACY_ACCESS_COOKIE_NAME);
  response.cookies.delete(REAL_SURFACE_COOKIE_NAME);
  return response;
}
