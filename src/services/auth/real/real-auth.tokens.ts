/**
 * Token lifecycle — real (Nest) auth mode.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Access token   → module-level memory (JS variable, این تب)             │
 * │  Refresh token  → httpOnly cookie (فقط سرور می‌خواند — XSS کور است)    │
 * │  sessionStorage → هیچ‌چیز نمی‌نویسیم                                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * چرا این طراحی؟
 *  - sessionStorage / localStorage از طریق `document.*` در XSS قابل دسترسی‌اند.
 *  - httpOnly cookie را JavaScript سمت کلاینت اصلاً نمی‌بیند؛ تنها Next.js
 *    API Routes (Node.js runtime) می‌توانند آن را بخوانند یا بنویسند.
 *  - Access token با هر refresh کوتاه‌عمر است (معمولاً ۱۵ دقیقه) و فقط در
 *    حافظهٔ ماژول (closure) نگه داشته می‌شود — با بستن تب از بین می‌رود.
 *
 * Public API:
 *   writeRealAuthTokens(tokens)   ← پس از هر login / refresh موفق
 *   clearRealAuthTokens()         ← logout / 401 قطعی
 *   readRealAccessToken()         ← bearer برای درخواست‌های API
 *   readRealRefreshToken()        ← فقط برای ارسال به /api/auth/refresh
 *   readRealTokenExpiresAt()      ← نمایش زمان انقضا در UI
 *   peekRealAuthTokens()          ← بررسی وجود session بدون side-effect
 */

import Cookies from 'js-cookie';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import {
  REAL_SURFACE_COOKIE_NAME,
  REAL_SURFACE_COOKIE_OPTIONS,
  type AuthSurface,
} from '@/lib/real-auth-cookie';
import type { NestLoginTokens } from '@/services/auth/real/nest-auth-mappers';

// ─── Module-level memory (access token فقط اینجا زندگی می‌کند) ───────────────

interface MemoryTokens {
  token: string;
  /** رفرش‌توکن در حافظه فقط برای پاس به /api/auth/refresh (کلاینت به Nest مستقیم نمی‌زند) */
  refreshToken: string;
  tokenExpires: number;
}

let _mem: MemoryTokens | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * هشدار dev-only اگر `tokenExpires` شبیه epoch-ثانیه باشد نه epoch-میلی‌ثانیه.
 *
 * چرا این چک لازم است؟ کل منطق انقضا (`readRealAccessToken`,
 * `ACCESS_REFRESH_SKEW_MS`) فرض می‌کند `tokenExpires` یک epoch میلی‌ثانیه‌ای
 * است (`new Date(tokenExpires)` در nest-auth-mappers.ts هم همین فرض را دارد).
 * اگر Nest این مقدار را به‌صورت epoch-ثانیه برگرداند (رایج در JWT `exp`)،
 * عدد ۱۰ رقمی به‌جای ۱۳ رقمی می‌شود و `new Date(...)` چیزی حدود سال ۱۹۷۰
 * می‌سازد — یعنی توکن همیشه «منقضی» به‌نظر می‌رسد، هیچ‌وقت Bearer فرستاده
 * نمی‌شود، و هر ریکوئست یک refresh اضافه می‌زند. این فقط از console لاگ قابل
 * کشف است، نه از تایپ‌اسکریپت — برای همین اینجا صریح چک می‌شود.
 */
function warnIfTokenExpiresLooksLikeSeconds(tokenExpires: number): void {
  if (process.env.NODE_ENV === 'production') return;
  // یک epoch میلی‌ثانیه‌ای امروز ۱۳ رقم است؛ epoch ثانیه‌ای فقط ۱۰ رقم.
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

/**
 * Session cookie بدون expires — حضور در مرورگر برای Edge proxy.
 * Proxy فقط وجود cookie را چک می‌کند، مقدار را نه.
 */
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

/**
 * خطای اختصاصی وقتی httpOnly refresh cookie، پس از تلاش‌های مکرر، همچنان
 * قابل‌نوشتن نبود. یک Error معمولی است (نه ApiClientError از api-error.ts)
 * تا وابستگی HTTP/ky به این فایل اضافه نشود — همان مرزبندی معماری که در
 * کامنت بالای فایل مستند شده. hookهای auth موجود (usePasswordLogin,
 * useOtpLogin, useAdminGate, ...) از قبل با `error.message` کار می‌کنند
 * (رجوع کنید به readAuthErrorMessage) پس نیازی به تغییر آن‌ها نیست.
 */
export class AuthSessionPersistError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AuthSessionPersistError';
  }
}

const SET_TOKENS_MAX_ATTEMPTS = 3;
/** فاصلهٔ بین تلاش‌ها — index صفر بین تلاش ۱ و ۲، index یک بین تلاش ۲ و ۳. */
const SET_TOKENS_RETRY_DELAYS_MS = [300, 900];
/** هر تلاش حداکثر این‌قدر منتظر می‌ماند؛ درخواست آویزان نباید login را برای همیشه معلق نگه دارد. */
const SET_TOKENS_ATTEMPT_TIMEOUT_MS = 8_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** یک تلاش خام برای POST /api/auth/set-tokens، با timeout مستقل از هم. */
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
 * refresh token و surface را در httpOnly cookie ذخیره می‌کند (server-side route).
 * surface تعیین می‌کند /api/auth/refresh به کدام Nest endpoint بزند.
 *
 * این عملیات برای صحت session حیاتی است — اگر بی‌صدا شکست بخورد، کاربر با
 * ظاهر «ورود موفق» در حافظه می‌ماند اما بدون کوکی refresh، و با اولین
 * تازه‌سازی صفحه یا اولین ۴۰۱ به‌طور غیرمنتظره logout می‌شود. برای همین:
 *
 *  ۱. تا SET_TOKENS_MAX_ATTEMPTS بار با backoff تلاش می‌کند — خطاهای شبکه/
 *     timeout/۵xx گذرا فرض می‌شوند و retry می‌خورند؛ خطای ۴xx (بدنهٔ نامعتبر
 *     و مشابه) با تلاش مجدد حل نمی‌شود، پس فوراً متوقف می‌شویم.
 *  ۲. اگر همهٔ تلاش‌ها شکست بخورند، AuthSessionPersistError پرتاب می‌کند تا
 *     caller (writeRealAuthTokens) بتواند state نیمه‌کاره را rollback کند و
 *     خطا را به فرم/UI برساند، نه اینکه سکوت کند.
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
      if (res.status >= 400 && res.status < 500) break; // خطای client — retry فایده ندارد
    } catch (err) {
      lastError = err; // NetworkError / AbortError(timeout) — گذراست، تلاش بعدی را امتحان کن
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

/** httpOnly refresh cookie و surface cookie را از طریق route پاک می‌کند. */
async function clearRefreshTokenCookie(): Promise<void> {
  if (!isBrowser()) return;
  // surface cookie را سمت کلاینت هم پاک می‌کنیم (حساس نیست — فقط httpOnly نبود)
  Cookies.remove(REAL_SURFACE_COOKIE_NAME, { path: '/' });
  try {
    await fetch('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // در بدترین حالت session cookie هم پاک می‌شود و Edge proxy به login ریدایرکت می‌کند.
  }
}

/**
 * درخواست‌های in-flight را با یک پنجرهٔ ایمن پوشش می‌دهیم:
 * اگر کمتر از ۶۰ ثانیه به expire شدن مانده، token را «منقضی» تلقی کن
 * تا hook 401 قبل از فرستادن request یک refresh بزند، نه بعد از 401.
 */
const ACCESS_REFRESH_SKEW_MS = 60_000;

// ─── Public write API ─────────────────────────────────────────────────────────

/**
 * پس از login یا refresh موفق فراخوانی می‌شود.
 *
 * - Access token → حافظهٔ ماژول
 * - Refresh token → httpOnly cookie (از طریق /api/auth/set-tokens)
 * - Presence cookie → برای Edge proxy
 *
 * تابع async است — await می‌کند تا httpOnly cookie قبل از هر redirect
 * قطعاً ست شده باشد. بدون این تضمین، رفرش صفحه بلافاصله پس از login
 * می‌تواند karvita_rt را خالی ببیند و session را باطل کند.
 *
 * تراکنشی رفتار می‌کند: اگر persistRefreshTokenInCookie (پس از تلاش‌های
 * داخلی‌اش) شکست بخورد، تمام side-effectهای سنکرون بالا (memory، presence
 * cookie، surface cookie) را rollback می‌کند و AuthSessionPersistError را
 * دوباره پرتاب می‌کند. بدون این rollback، کاربر یک session نیمه‌کاره
 * (access token در حافظه بدون کوکی refresh معتبر) می‌گرفت که ظاهرش «ورود
 * موفق» بود ولی با اولین تازه‌سازی صفحه یا اولین ۴۰۱ بی‌دلیل logout می‌شد.
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
  // surface cookie سمت کلاینت (دسترس JS دارد چون حساس نیست)
  if (isBrowser()) {
    Cookies.set(REAL_SURFACE_COOKIE_NAME, surface, {
      path: REAL_SURFACE_COOKIE_OPTIONS.path,
      sameSite: REAL_SURFACE_COOKIE_OPTIONS.sameSite,
      secure: REAL_SURFACE_COOKIE_OPTIONS.secure,
      expires: 7, // روز
    });
  }

  try {
    // هر دو توکن را httpOnly cookie می‌کنیم:
    // - karvita_rt: refresh token (برای rotation)
    // - karvita_at: access token (برای Authorization header در /api/auth/refresh، اگر Nest نیاز داشت)
    await persistRefreshTokenInCookie(tokens.refreshToken, tokens.token, surface);
  } catch (error) {
    // rollback کامل — نباید state نیمه‌کاره باقی بماند. clearRealAuthTokens
    // هم memory/presence cookie را فوری پاک می‌کند هم (fire-and-forget)
    // درخواست /api/auth/clear-tokens را می‌زند تا اگر set-tokens جزئاً
    // موفق شده بود (مثلاً فقط surface cookie ست شده) آن هم پاک شود.
    clearRealAuthTokens();
    throw error;
  }
}

/**
 * logout یا 401 قطعی.
 * حافظهٔ ماژول و هر دو cookie را پاک می‌کند.
 * حذف memory سنکرونه است — cookie آسنکرون (fire-and-forget).
 */
export function clearRealAuthTokens(): void {
  _mem = null;           // فوری — هیچ request جدیدی token نمی‌گیرد
  clearPresenceCookie(); // فوری — Edge proxy دیگر session نمی‌بیند
  void clearRefreshTokenCookie(); // آسنکرون — httpOnly cookie را از server پاک می‌کنه
}

// ─── Public read API ──────────────────────────────────────────────────────────

/**
 * Access token را برمی‌گرداند — null اگر منقضی شده یا موجود نیست.
 * منقضی‌شدن با skew تشخیص داده می‌شود تا in-flight request‌ها سالم بمانند.
 */
export function readRealAccessToken(): string | null {
  if (!_mem) return null;
  if (_mem.tokenExpires <= Date.now() + ACCESS_REFRESH_SKEW_MS) return null;
  return _mem.token;
}

/**
 * Refresh token را از حافظهٔ ماژول برمی‌گرداند.
 * این مقدار برای ارسال به /api/auth/refresh استفاده می‌شود (نه مستقیم به Nest).
 * اگر تب تازه باز شده و حافظه خالی است null برمی‌گردد — caller باید
 * /api/auth/refresh را بدون body صدا بزند (route خودش از httpOnly cookie می‌خواند).
 */
export function readRealRefreshToken(): string | null {
  return _mem?.refreshToken ?? null;
}

/** ISO string زمان انقضای access token — برای نمایش در UI یا محاسبهٔ TTL. */
export function readRealTokenExpiresAt(): string | null {
  if (!_mem) return null;
  return new Date(_mem.tokenExpires).toISOString();
}

/**
 * بررسی وجود session در حافظه بدون هیچ side-effect.
 * اگر null برگشت — باید /api/auth/refresh را امتحان کرد (شاید cookie هنوز معتبر باشد).
 */
export function peekRealAuthTokens(): NestLoginTokens | null {
  return _mem
    ? { token: _mem.token, refreshToken: _mem.refreshToken, tokenExpires: _mem.tokenExpires }
    : null;
}

/**
 * سطح (surface) جاری session را از cookie کلاینت می‌خواند.
 * httpOnly نیست — پس JS دسترسی دارد.
 * برگشت: 'admin' | 'user' | null (اگر cookie وجود نداشته باشد)
 */
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
