/**
 * نام و تنظیمات httpOnly cookie که refresh token واقعی (Nest) را نگه می‌دارد.
 *
 * فقط Node.js runtime (این API Routeها) به مقدار این cookie دسترسی دارد.
 * جاوااسکریپت سمت کلاینت — از جمله کدهای تزریق‌شده در XSS — هیچ راهی برای
 * خواندن یا نوشتن آن ندارد؛ این دقیقاً همان چیزی است که httpOnly تضمین می‌کند.
 *
 * access token عمداً اینجا نیست: در حافظهٔ ماژول سمت کلاینت نگه داشته می‌شود
 * (رجوع کنید به real-auth.tokens.ts) و در document cookie یا storage قرار
 * نمی‌گیرد.
 */
export const REAL_REFRESH_COOKIE_NAME = 'karvita_rt';

/**
 * Access token — httpOnly cookie برای ارسال سرور-به-سرور در /api/auth/refresh.
 * کوتاه‌عمر است (با TTL access token همخوان) تا در صورت لیک، تأثیر محدود باشد.
 * JS سمت کلاینت این cookie را نمی‌بیند.
 */
export const REAL_ACCESS_COOKIE_NAME = 'karvita_at';

/**
 * Surface cookie — مشخص می‌کند session از کدام API surface آمده ('admin' | 'user').
 *
 * این cookie httpOnly نیست چون مقدار حساسی ندارد — فقط به /api/auth/refresh
 * می‌گوید کدام Nest endpoint را بزند:
 *   admin → POST v1/admin/auth/refresh
 *   user  → POST v1/auth/refresh
 *
 * بدون این cookie، رفرش همیشه به v1/auth/refresh می‌رفت و refresh token ادمین
 * رد می‌شد (401) که باعث می‌شد با رفرش صفحه کاربر ادمین اخراج شود.
 */
export const REAL_SURFACE_COOKIE_NAME = 'karvita_surface';

export type AuthSurface = 'admin' | 'user';

export const REAL_SURFACE_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // ۷ روز — همتراز با refresh token
};

/** هفت روز — با TTL معمول refresh token همخوان است. */
const REAL_REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * ۲۴ ساعت — برای backup در زمان refresh کافیه.
 * این cookie در عمل فقط در /api/auth/refresh خوانده می‌شود و تاثیری
 * روی TTL واقعی access token در مموری ندارد.
 */
const REAL_ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export interface RealRefreshCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

export const REAL_REFRESH_COOKIE_OPTIONS: RealRefreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: REAL_REFRESH_COOKIE_MAX_AGE_SECONDS,
};

export const REAL_ACCESS_COOKIE_OPTIONS: RealRefreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: REAL_ACCESS_COOKIE_MAX_AGE_SECONDS,
};
