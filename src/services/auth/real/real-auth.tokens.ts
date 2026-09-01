/**
 * چرخهٔ توکن حالت real: access در حافظهٔ ماژول این تب؛ refresh فقط کوکی httpOnly
 * که Route Handler می‌خواند. در sessionStorage ننویس — XSS می‌بیندش.
 */

import Cookies from 'js-cookie';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import {
  REAL_SURFACE_COOKIE_NAME,
  REAL_SURFACE_COOKIE_OPTIONS,
  type AuthSurface,
} from '@/lib/real-auth-cookie';
import type { NestLoginTokens } from '@/services/auth/real/nest-auth-mappers';

interface MemoryTokens {
  token: string;
  /** رفرش در حافظه فقط برای پاس به `/api/auth/refresh`؛ کلاینت مستقیم به Nest نزند. */
  refreshToken: string;
  tokenExpires: number;
}

let _mem: MemoryTokens | null = null;

/** اگر Nest `tokenExpires` را epoch-ثانیه بدهد، توکن همیشه منقضی دیده می‌شود — JWT `exp` رایج است. */
function warnIfTokenExpiresLooksLikeSeconds(tokenExpires: number): void {
  if (process.env.NODE_ENV === 'production') return;
  // epoch میلی‌ثانیه ۱۳ رقم است؛ ثانیه ۱۰ رقم.
  if (tokenExpires > 0 && tokenExpires < 1_000_000_000_000) {
    console.warn(
      '[real-auth.tokens] tokenExpires به‌نظر epoch-ثانیه می‌رسد نه epoch-میلی‌ثانیه ' +
      `(مقدار: ${tokenExpires} → ${new Date(tokenExpires).toISOString()}). ` +
      'اگر Nest واقعاً ثانیه می‌فرستد، این مقدار باید قبل از ذخیره در ' +
      'tokenExpires * 1000 ضرب شود، وگرنه توکن همیشه منقضی تلقی می‌شود.'
    );
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** کوکی حضور بدون مقدار برای Edge proxy؛ مقدار را چک نمی‌کند. */
function setPresenceCookie(): void {
  if (!isBrowser()) return;
  Cookies.set(AUTH_COOKIE_NAME, '1', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function clearPresenceCookie(): void {
  if (!isBrowser()) return;
  Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
}

/** شکست نوشتن کوکی رفرش؛ `Error` معمولی تا این فایل به ky وابسته نشود. */
export class AuthSessionPersistError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AuthSessionPersistError';
  }
}

const SET_TOKENS_MAX_ATTEMPTS = 3;
/** backoff بین تلاش‌های نوشتن کوکی. */
const SET_TOKENS_RETRY_DELAYS_MS = [300, 900];
/** سقف هر تلاش؛ درخواست آویزان login را معلق نکند. */
const SET_TOKENS_ATTEMPT_TIMEOUT_MS = 8_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** یک POST به `/api/auth/set-tokens` با timeout جدا. */
async function requestSetTokensOnce(
  refreshToken: string,
  accessToken?: string,
  surface?: AuthSurface,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SET_TOKENS_ATTEMPT_TIMEOUT_MS);
  try {
    return await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, accessToken, surface }),
      credentials: 'include',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * کوکی رفرش حیاتی است — شکست بی‌صدا یعنی ورود ظاهری بدون refresh و logout ناگهانی.
 * ۴xx را retry نکن؛ بعد از اتمام تلاش‌ها `AuthSessionPersistError`.
 */
async function persistRefreshTokenInCookie(
  refreshToken: string,
  accessToken?: string,
  surface?: AuthSurface,
): Promise<void> {
  if (!isBrowser()) return;

  let lastError: unknown;

  for (let attempt = 0; attempt < SET_TOKENS_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(SET_TOKENS_RETRY_DELAYS_MS[attempt - 1] ?? 900);
    }
    try {
      const res = await requestSetTokensOnce(refreshToken, accessToken, surface);
      if (res.ok) return;

      lastError = new Error(`set-tokens route returned ${res.status}`);
      if (res.status >= 400 && res.status < 500) break; // ۴xx با retry حل نمی‌شود
    } catch (err) {
      lastError = err; // شبکه/timeout گذرا
    }
  }

  console.error(
    '[real-auth.tokens] set-tokens failed after retries — rolling back session',
    lastError
  );
  throw new AuthSessionPersistError(
    'ورود کامل نشد؛ ارتباط با سرور برای تکمیل نشست برقرار نشد. لطفاً دوباره تلاش کنید.',
    lastError
  );
}

/** پاک کردن کوکی رفرش/surface از Route. */
async function clearRefreshTokenCookie(): Promise<void> {
  if (!isBrowser()) return;
  // surface httpOnly نیست — سمت کلاینت هم پاک کن
  Cookies.remove(REAL_SURFACE_COOKIE_NAME, { path: '/' });
  try {
    await fetch('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // اگر Route نرسید، presence cookie پایین‌تر پاک می‌شود و proxy به login می‌فرستد.
  }
}

/** کمتر از ۶۰ثانیه تا انقضا را منقضی بگیر تا هوک قبل از ۴۰۱ refresh بزند. */
const ACCESS_REFRESH_SKEW_MS = 60_000;

/**
 * بعد از login/refresh: access در حافظه، رفرش در httpOnly. await تا قبل از redirect کوکی ست شود.
 * شکست persist → rollback کامل؛ وگرنه سشن نیمه‌کاره با ظاهر ورود موفق می‌ماند.
 */
export async function writeRealAuthTokens(
  tokens: NestLoginTokens,
  surface: AuthSurface = 'user',
): Promise<void> {
  warnIfTokenExpiresLooksLikeSeconds(tokens.tokenExpires);
  _mem = {
    token: tokens.token,
    refreshToken: tokens.refreshToken,
    tokenExpires: tokens.tokenExpires,
  };
  setPresenceCookie();
  // surface حساس نیست — JS می‌خواندش
  if (isBrowser()) {
    Cookies.set(REAL_SURFACE_COOKIE_NAME, surface, {
      path: REAL_SURFACE_COOKIE_OPTIONS.path,
      sameSite: REAL_SURFACE_COOKIE_OPTIONS.sameSite,
      secure: REAL_SURFACE_COOKIE_OPTIONS.secure,
      expires: 7, // js-cookie: روز نه ثانیه
    });
  }

  try {
    // `karvita_rt` برای rotation؛ `karvita_at` اگر Nest روی refresh به Bearer نیاز داشت
    await persistRefreshTokenInCookie(tokens.refreshToken, tokens.token, surface);
  } catch (error) {
    // rollback: اگر set-tokens جزئی موفق بود، clear-tokens هم بزن
    clearRealAuthTokens();
    throw error;
  }
}

/** logout/۴۰۱ قطعی؛ حافظه فوری، کوکی httpOnly آسنکرون. */
export function clearRealAuthTokens(): void {
  _mem = null;           // فوری تا request جدید token نگیرد
  clearPresenceCookie(); // فوری تا proxy سشن نبیند
  void clearRefreshTokenCookie(); // httpOnly فقط از سرور پاک می‌شود
}

/** access یا null اگر با skew منقضی شده. */
export function readRealAccessToken(): string | null {
  if (!_mem) return null;
  if (_mem.tokenExpires <= Date.now() + ACCESS_REFRESH_SKEW_MS) return null;
  return _mem.token;
}

/** رفرش حافظه برای `/api/auth/refresh`؛ تب تازه null است — Route از کوکی می‌خواند. */
export function readRealRefreshToken(): string | null {
  return _mem?.refreshToken ?? null;
}

/** ISO انقضای access برای UI. */
export function readRealTokenExpiresAt(): string | null {
  if (!_mem) return null;
  return new Date(_mem.tokenExpires).toISOString();
}

/** وجود سشن در حافظه بدون side-effect؛ null یعنی `/api/auth/refresh` را امتحان کن. */
export function peekRealAuthTokens(): NestLoginTokens | null {
  return _mem
    ? { token: _mem.token, refreshToken: _mem.refreshToken, tokenExpires: _mem.tokenExpires }
    : null;
}

/** سطح سشن از کوکی کلاینت (`admin` | `user`)؛ httpOnly نیست. */
export function readRealAuthSurface(): AuthSurface | null {
  if (!isBrowser()) return null;
  const value = document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${REAL_SURFACE_COOKIE_NAME}=`))
    ?.split('=')
    .slice(1)
    .join('=')
    .trim();
  if (value === 'admin') return 'admin';
  if (value === 'user') return 'user';
  return null;
}
