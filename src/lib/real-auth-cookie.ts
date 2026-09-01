/**
 * کوکی httpOnly رفرش Nest؛ فقط Route Handler در Node می‌خواند.
 * access اینجا نیست — حافظهٔ ماژول (`real-auth.tokens.ts`)؛ در storage ننویس.
 */
export const REAL_REFRESH_COOKIE_NAME = 'karvita_rt';

/** access کوتاه‌عمر httpOnly برای `Authorization` در `/api/auth/refresh`؛ JS نمی‌بیند. */
export const REAL_ACCESS_COOKIE_NAME = 'karvita_at';

/** `admin` | `user` تا `/api/auth/refresh` مسیر درست Nest را بزند؛ بدون آن ادمین ۴۰۱ می‌شود. */
export const REAL_SURFACE_COOKIE_NAME = 'karvita_surface';

export type AuthSurface = 'admin' | 'user';

export const REAL_SURFACE_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // هفت روز — همتراز TTL رفرش
};

/** هفت روز — با TTL معمول refresh token همخوان است. */
const REAL_REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** ۲۴ ساعت backup برای refresh؛ TTL واقعی access در حافظه است. */
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
