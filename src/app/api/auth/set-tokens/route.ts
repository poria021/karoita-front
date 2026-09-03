/**
 * `POST /api/auth/set-tokens` — تنها نویسندهٔ کوکی httpOnly رفرش.
 * کلاینت بعد از این Route رفرش را در storage ننویسد.
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  REAL_REFRESH_COOKIE_NAME,
  REAL_REFRESH_COOKIE_OPTIONS,
  REAL_SURFACE_COOKIE_NAME,
  REAL_SURFACE_COOKIE_OPTIONS,
  type AuthSurface,
} from '@/lib/real-auth-cookie';
import { assertSameOriginPost } from '@/lib/auth-origin-guard';

interface SetTokensBody {
  refreshToken?: unknown;
  /** `admin` | `user` — `/api/auth/refresh` کدام مسیر Nest را بزند */
  surface?: unknown;
}

export async function POST(request: NextRequest) {
  // CSRF: کوکی httpOnly می‌نویسد؛ فقط same-origin تا سایت متقاطع session را fix نکند.
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

  // surface: `admin` → `v1/admin/auth/refresh` | `user` → `v1/auth/refresh`
  const surface: AuthSurface =
    typeof body.surface === 'string' && body.surface === 'admin' ? 'admin' : 'user';
  response.cookies.set(REAL_SURFACE_COOKIE_NAME, surface, REAL_SURFACE_COOKIE_OPTIONS);

  return response;
}
