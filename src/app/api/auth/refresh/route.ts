/**
 * `POST /api/auth/refresh` — تنها خوانندهٔ کوکی httpOnly رفرش؛ کلاینت مقدار را نمی‌بیند.
 * سرور-به-سرور به Nest؛ access جدید فقط در حافظهٔ ماژول کلاینت بماند.
 */
import { NextRequest, NextResponse } from 'next/server';

import { assertSameOriginPost } from '@/lib/auth-origin-guard';
import {
  LEGACY_ACCESS_COOKIE_NAME,
  REAL_REFRESH_COOKIE_NAME,
  REAL_REFRESH_COOKIE_OPTIONS,
  REAL_SURFACE_COOKIE_NAME,
  type AuthSurface,
} from '@/lib/real-auth-cookie';
import {
  accessTokenFromRefreshPayload,
  extractRotatedRefreshToken,
  NEST_REFRESH_PATHS,
  NEST_SESSION_PATHS,
  resolveAuthSurface,
  unwrapRefreshPayloadData,
} from '@/services/auth/real/refresh-route-helpers';

/** سرور-به-سرور: `BACKEND_INTERNAL_URL` بدون CORS؛ وگرنه `NEXT_PUBLIC_API_URL`. */
const NEST_API_URL =
  (process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '')
    .replace(/\/$/, '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** بعد از refresh، `/auth/me` یا `/admin/auth/me` تا payload کاربر کامل شود. */
async function fetchSessionUser(
  accessToken: string,
  baseUrl: string,
  surface: AuthSurface,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${baseUrl}/${NEST_SESSION_PATHS[surface]}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    if (!isRecord(json)) return null;
    return isRecord(json.data) ? json.data : json;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // CSRF: کوکی رفرش را rotate می‌کند؛ فقط same-origin تا سایت متقاطع نشست را تمدید/باطل نکند.
  const guard = assertSameOriginPost(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.reason }, { status: guard.status });
  }

  const refreshToken = request.cookies.get(REAL_REFRESH_COOKIE_NAME)?.value;
  const rawSurface = request.cookies.get(REAL_SURFACE_COOKIE_NAME)?.value;
  const surface: AuthSurface = resolveAuthSurface(rawSurface);
  const nestRefreshPath = NEST_REFRESH_PATHS[surface];

  if (process.env.NODE_ENV !== 'production') {
    const allCookies = request.cookies.getAll();
    console.log('[/api/auth/refresh] cookies present:', allCookies.map(c => c.name));
    console.log('[/api/auth/refresh] rt present:', !!refreshToken, '| surface:', surface);
  }

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'نشست منقضی شده است.' },
      { status: 401 }
    );
  }

  if (!NEST_API_URL) {
    return NextResponse.json(
      { error: 'سرویس API پیکربندی نشده است.' },
      { status: 500 }
    );
  }

  let nestResponse: Response;
  try {
    // Nest روی refresh، `Authorization: Bearer` را به‌عنوان refresh می‌گیرد نه access.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/refresh] → POST', `${NEST_API_URL}/${nestRefreshPath}`);
    }
    nestResponse = await fetch(`${NEST_API_URL}/${nestRefreshPath}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
      cache: 'no-store',
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/refresh] ← Nest status:', nestResponse.status);
    }
  } catch (err) {
    console.error('[/api/auth/refresh] fetch to Nest failed:', err);
    return NextResponse.json(
      { error: 'ارتباط با سرویس احراز هویت برقرار نشد.' },
      { status: 502 }
    );
  }

  if (nestResponse.status === 401 || nestResponse.status === 403) {
    // رفرش باطل — کوکی فاسد را پاک کن تا کلاینت به login برود.
    if (process.env.NODE_ENV !== 'production') {
      try {
        const errBody = await nestResponse.clone().text();
        console.log('[/api/auth/refresh] Nest 401/403 body:', errBody);
      } catch {}
    }
    const expired = NextResponse.json(
      { error: 'نشست منقضی شده است.' },
      { status: 401 }
    );
    expired.cookies.delete(REAL_REFRESH_COOKIE_NAME);
    expired.cookies.delete(REAL_SURFACE_COOKIE_NAME);
    expired.cookies.delete(LEGACY_ACCESS_COOKIE_NAME);
    return expired;
  }

  if (!nestResponse.ok) {
    return NextResponse.json(
      { error: 'تمدید نشست با خطا مواجه شد.' },
      { status: nestResponse.status }
    );
  }

  let payload: unknown;
  try {
    payload = await nestResponse.json();
  } catch {
    return NextResponse.json(
      { error: 'پاسخ سرور نامعتبر است.' },
      { status: 502 }
    );
  }

  // اگر Nest فقط توکن بدهد، `/auth/me` را سرور-به-سرور ضمیمه کن تا کلاینت دوباره `me` نزند.
  {
    const data = unwrapRefreshPayloadData(payload);
    const newAccessToken = accessTokenFromRefreshPayload(payload);

    if (!data) {
      const response = NextResponse.json(payload);
      return response;
    }

    if (newAccessToken) {
      if (surface === 'admin' && !isRecord(data.admin)) {
        const adminUser = await fetchSessionUser(newAccessToken, NEST_API_URL, 'admin');
        if (adminUser) {
          (data as Record<string, unknown>).admin = adminUser;
        }
      } else if (surface === 'user' && !isRecord(data.user) && !isRecord(data.newUser)) {
        // بدون `user`، `looksLikeNestLoginResponse` در کلاینت false می‌شود.
        const userObj = await fetchSessionUser(newAccessToken, NEST_API_URL, 'user');
        if (userObj) {
          (data as Record<string, unknown>).user = userObj;
        }
      }
    }
  }

  const response = NextResponse.json(payload);

  const rotatedRefreshToken = extractRotatedRefreshToken(payload);
  if (rotatedRefreshToken) {
    response.cookies.set(
      REAL_REFRESH_COOKIE_NAME,
      rotatedRefreshToken,
      REAL_REFRESH_COOKIE_OPTIONS
    );
    // surface را تمدید کن تا بعد از rotation مسیر Nest درست بماند.
    response.cookies.set(REAL_SURFACE_COOKIE_NAME, surface, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}
