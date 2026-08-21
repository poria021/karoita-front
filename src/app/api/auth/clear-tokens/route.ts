/**
 * POST /api/auth/clear-tokens
 *
 * httpOnly refresh-token cookie را پاک می‌کند. روی logout و روی خطای ۴۰۱
 * قطعی (پس از تلاش ناموفق برای refresh) فراخوانی می‌شود.
 */
import { NextResponse } from 'next/server';

import { REAL_REFRESH_COOKIE_NAME } from '@/lib/real-auth-cookie';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REAL_REFRESH_COOKIE_NAME);
  return response;
}
