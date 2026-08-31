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
  REAL_ACCESS_COOKIE_NAME,
  REAL_ACCESS_COOKIE_OPTIONS,
  REAL_SURFACE_COOKIE_NAME,
  REAL_SURFACE_COOKIE_OPTIONS,
  type AuthSurface,
} from '@/lib/real-auth-cookie';
import { assertSameOriginPost } from '@/lib/auth-origin-guard';

interface SetTokensBody {
  refreshToken?: unknown;
  accessToken?: unknown;
  /** 'admin' | 'user' — تعیین می‌کند /api/auth/refresh کدام Nest endpoint بزند */
  surface?: unknown;
}

export async function POST(request: NextRequest) {
  // CSRF: این Route cookie httpOnly رفرش را می‌نویسد؛ فقط فراخوانی same-origin
  // مجاز است تا یک سایت متقاطع نتواند session را ثابت-fix کند.
  const guard = assertSameOriginPost(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.reason }, { status: guard.status });
  }

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
  response.cookies.set(REAL_REFRESH_COOKIE_NAME, body.refreshToken, REAL_REFRESH_COOKIE_OPTIONS);

  // access token را هم ذخیره می‌کنیم تا Route Handler /api/auth/refresh بتواند
  // آن را در Authorization header به Nest بفرستد (اگر Nest نیاز داشت)
  if (typeof body.accessToken === 'string' && body.accessToken) {
    response.cookies.set(REAL_ACCESS_COOKIE_NAME, body.accessToken, REAL_ACCESS_COOKIE_OPTIONS);
  }

  // surface cookie — مشخص می‌کند /api/auth/refresh کدام Nest endpoint بزند
  // 'admin' → v1/admin/auth/refresh | 'user' → v1/auth/refresh
  const surface: AuthSurface =
    typeof body.surface === 'string' && body.surface === 'admin' ? 'admin' : 'user';
  response.cookies.set(REAL_SURFACE_COOKIE_NAME, surface, REAL_SURFACE_COOKIE_OPTIONS);

  return response;
}
