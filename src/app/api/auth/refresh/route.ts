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
  REAL_ACCESS_COOKIE_NAME,
  REAL_ACCESS_COOKIE_OPTIONS,
} from '@/lib/real-auth-cookie';

const NEST_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const NEST_REFRESH_PATH = 'v1/auth/refresh';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** رفرش‌توکن جدید را از پاسخ Nest (مستقیم یا زیر `data`) استخراج می‌کند. */
function extractRotatedRefreshToken(raw: unknown): string | null {
  if (!isRecord(raw)) return null;
  const data = isRecord(raw.data) ? raw.data : raw;
  return typeof data.refreshToken === 'string' ? data.refreshToken : null;
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REAL_REFRESH_COOKIE_NAME)?.value;
  const accessToken  = request.cookies.get(REAL_ACCESS_COOKIE_NAME)?.value;

  if (process.env.NODE_ENV !== 'production') {
    const allCookies = request.cookies.getAll();
    console.log('[/api/auth/refresh] cookies:', allCookies.map(c => c.name));
    console.log('[/api/auth/refresh] rt:', !!refreshToken, '| at:', !!accessToken);
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
    // Nest از Authorization: Bearer <refreshToken> استفاده می‌کنه (همون یک
    // security scheme مشترک روی کل API) — نه accessToken قدیمی، و بدنه هم
    // لازم نداره. تأیید شده با تست مستقیم روی Swagger (2026-08-24).
    const nestHeaders: Record<string, string> = {
      Authorization: `Bearer ${refreshToken}`,
    };
    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/refresh] →', `${NEST_API_URL}/${NEST_REFRESH_PATH}`);
    }
    nestResponse = await fetch(`${NEST_API_URL}/${NEST_REFRESH_PATH}`, {
      method: 'POST',
      headers: nestHeaders,
      cache: 'no-store',
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[/api/auth/refresh] ← Nest:', nestResponse.status);
    }
  } catch (err) {
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

  const response = NextResponse.json(payload);

  const rotatedRefreshToken = extractRotatedRefreshToken(payload);
  if (rotatedRefreshToken) {
    response.cookies.set(
      REAL_REFRESH_COOKIE_NAME,
      rotatedRefreshToken,
      REAL_REFRESH_COOKIE_OPTIONS
    );
  }

  return response;
}
