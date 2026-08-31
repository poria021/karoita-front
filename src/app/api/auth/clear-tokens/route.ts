/**
 * POST /api/auth/clear-tokens
 *
 * httpOnly refresh-token cookie را پاک می‌کند. روی logout و روی خطای ۴۰۱
 * قطعی (پس از تلاش ناموفق برای refresh) فراخوانی می‌شود.
 */
import { NextResponse, type NextRequest } from 'next/server';

import {
  REAL_REFRESH_COOKIE_NAME,
  REAL_ACCESS_COOKIE_NAME,
  REAL_SURFACE_COOKIE_NAME,
} from '@/lib/real-auth-cookie';
import { assertSameOriginPost } from '@/lib/auth-origin-guard';

export async function POST(request: NextRequest) {
  // CSRF: این Route cookie رفرش را پاک می‌کند؛ فقط فراخوانی same-origin مجاز
  // است تا یک سایت متقاطع نتواند کاربر را به‌اجبار logout کند.
  const guard = assertSameOriginPost(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.reason }, { status: guard.status });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REAL_REFRESH_COOKIE_NAME);
  response.cookies.delete(REAL_ACCESS_COOKIE_NAME);
  response.cookies.delete(REAL_SURFACE_COOKIE_NAME);
  return response;
}
