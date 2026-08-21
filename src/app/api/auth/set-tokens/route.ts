/**
 * POST /api/auth/set-tokens
 *
 * refresh token را از بدنهٔ درخواست می‌گیرد و در یک httpOnly cookie ذخیره
 * می‌کند. این تنها نویسندهٔ cookie رفرش است — کلاینت پس از فراخوانی این
 * Route دیگر رفرش‌توکن را در sessionStorage/localStorage نمی‌نویسد.
 *
 * access token عمداً اینجا پذیرفته نمی‌شود؛ در حافظهٔ ماژول کلاینت می‌ماند
 * (رجوع کنید به src/services/auth/real-auth.tokens.ts).
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  REAL_REFRESH_COOKIE_NAME,
  REAL_REFRESH_COOKIE_OPTIONS,
} from '@/lib/real-auth-cookie';

interface SetTokensBody {
  refreshToken?: unknown;
}

export async function POST(request: NextRequest) {
  let body: SetTokensBody;
  try {
    body = (await request.json()) as SetTokensBody;
  } catch {
    return NextResponse.json(
      { error: 'بدنه درخواست نامعتبر است.' },
      { status: 400 }
    );
  }

  if (typeof body.refreshToken !== 'string' || !body.refreshToken) {
    return NextResponse.json(
      { error: 'refreshToken الزامی است.' },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    REAL_REFRESH_COOKIE_NAME,
    body.refreshToken,
    REAL_REFRESH_COOKIE_OPTIONS
  );
  return response;
}
