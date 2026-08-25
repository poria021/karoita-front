/**
 * POST /api/auth/refresh
 *
 * این Route تنها جایی است که refresh token واقعی را می‌خواند: مستقیماً از
 * httpOnly cookie سمت سرور، نه از بدنهٔ درخواست کلاینت. کلاینت هرگز مقدار
 * این کوکی را نمی‌بیند و بنابراین امکان ارسال دستی آن را هم ندارد.
 *
 * جریان:
 *   1. refreshToken را از cookie httpOnly می‌خواند.
 *   2. مستقیماً (سرور-به-سرور، بدون مشکل CORS) به Nest می‌زند.
 *   3. اگر Nest رفرش‌توکن جدید برگرداند (rotation)، cookie را به‌روزرسانی می‌کند.
 *   4. پاسخ خام Nest (شامل access token جدید) را به کلاینت برمی‌گرداند —
 *      کلاینت access token را فقط در حافظهٔ ماژول نگه می‌دارد (نه storage).
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  REAL_REFRESH_COOKIE_NAME,
  REAL_REFRESH_COOKIE_OPTIONS,
  REAL_SURFACE_COOKIE_NAME,
  type AuthSurface,
} from '@/lib/real-auth-cookie';

/**
 * سرور-تو-سرور: BACKEND_INTERNAL_URL به route داخلی، مستقیم
 * (بدون CORS). اگر ست نشده با NEXT_PUBLIC_API_URL فالبک می‌کنیم.
 */
const NEST_API_URL =
  (process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '')
    .replace(/\/$/, '');

/** Nest endpoint بر اساس surface انتخاب می‌شود */
const NEST_REFRESH_PATHS: Record<AuthSurface, string> = {
  user: 'v1/auth/refresh',
  admin: 'v1/admin/auth/refresh',
};

/** Nest session endpoint بر اساس surface */
const NEST_SESSION_PATHS: Record<AuthSurface, string> = {
  user: 'v1/auth/me',
  admin: 'v1/admin/auth/me',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * رفرش‌توکن جدید را از پاسخ Nest استخراج می‌کند.
 * Nest گاهی { token, refreshToken, ... } و گاهی { data: { token, refreshToken, ... } } می‌فرستد.
 * هر دو حالت را پشتیبانی می‌کنیم.
 */
function extractRotatedRefreshToken(raw: unknown): string | null {
  if (!isRecord(raw)) return null;
  // اول flat را چک کن
  if (typeof raw.refreshToken === 'string' && raw.refreshToken) return raw.refreshToken;
  // بعد nested data را چک کن
  if (isRecord(raw.data) && typeof raw.data.refreshToken === 'string' && raw.data.refreshToken) {
    return raw.data.refreshToken;
  }
  return null;
}

/**
 * پس از refresh موفق، /auth/me یا /admin/auth/me را با access token جدید می‌زنیم
 * تا اطلاعات کامل کاربر همراه payload برگردد.
 * برای ادمین: admin object | برای user: user object
 */
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
  const refreshToken = request.cookies.get(REAL_REFRESH_COOKIE_NAME)?.value;
  const rawSurface = request.cookies.get(REAL_SURFACE_COOKIE_NAME)?.value;
  const surface: AuthSurface = rawSurface === 'admin' ? 'admin' : 'user';
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
    // Nest از Authorization: Bearer <refreshToken> استفاده می‌کنه:
    // refresh endpoint یه token مستقل قبول می‌کنه، نه access token.
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
    // refresh token باطل/منقضی — cookie فاسد را پاک کن تا کلاینت به login برود.
    if (process.env.NODE_ENV !== 'production') {
      try {
        const errBody = await nestResponse.clone().text();
        console.log('[/api/auth/refresh] Nest 401/403 body:', errBody);
      } catch { /* ignore */ }
    }
    const expired = NextResponse.json(
      { error: 'نشست منقضی شده است.' },
      { status: 401 }
    );
    expired.cookies.delete(REAL_REFRESH_COOKIE_NAME);
    expired.cookies.delete(REAL_SURFACE_COOKIE_NAME);
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

  // اگر Nest فقط { token, refreshToken, tokenExpires } برگرداند (بدون user/admin object)،
  // اینجا /auth/me یا /admin/auth/me را سرور-تو-سرور می‌زنیم و نتیجه را ضمیمه می‌کنیم.
  // این کار باعث می‌شود performRealRefresh در کلاینت بتواند user/admin را parse کند
  // و نیازی به فراخوانی جداگانه‌ی /auth/me نباشد.
  {
    const data = isRecord(payload) && isRecord((payload as Record<string, unknown>).data)
      ? (payload as Record<string, unknown>).data as Record<string, unknown>
      : payload as Record<string, unknown>;

    const newAccessToken = typeof data.token === 'string' ? data.token : null;

    if (newAccessToken) {
      if (surface === 'admin' && !isRecord(data.admin)) {
        // ادمین: admin object را از /admin/auth/me می‌گیریم
        const adminUser = await fetchSessionUser(newAccessToken, NEST_API_URL, 'admin');
        if (adminUser) {
          (data as Record<string, unknown>).admin = adminUser;
        }
      } else if (surface === 'user' && !isRecord(data.user) && !isRecord(data.newUser)) {
        // کاربر عمومی: user object را از /auth/me می‌گیریم و به عنوان data.user اضافه می‌کنیم
        // این باعث می‌شود looksLikeNestLoginResponse در performRealRefresh true بشود
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
    // surface cookie را هم تمدید کن تا بعد از rotation هم درست بماند
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
