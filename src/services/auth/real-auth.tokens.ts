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
import type { NestLoginTokens } from '@/services/auth/nest-auth-mappers';

// ─── Module-level memory (access token فقط اینجا زندگی می‌کند) ───────────────

interface MemoryTokens {
  token: string;
  /** رفرش‌توکن در حافظه فقط برای پاس به /api/auth/refresh (کلاینت به Nest مستقیم نمی‌زند) */
  refreshToken: string;
  tokenExpires: number;
}

let _mem: MemoryTokens | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
 * refresh token را در httpOnly cookie ذخیره می‌کند (server-side route).
 * این تابع async است — fire-and-forget نیست؛ خطا را می‌بلعد تا login را
 * بلاک نکند ولی در console هشدار می‌دهد.
 */
async function persistRefreshTokenInCookie(refreshToken: string, accessToken?: string): Promise<void> {
  if (!isBrowser()) return;
  try {
    const res = await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, accessToken }),
      credentials: 'include',
    });
    if (!res.ok) {
      console.warn('[real-auth.tokens] set-tokens route returned', res.status);
    }
  } catch (err) {
    console.warn('[real-auth.tokens] set-tokens fetch failed', err);
  }
}

/** httpOnly refresh cookie را از طریق route پاک می‌کند. */
async function clearRefreshTokenCookie(): Promise<void> {
  if (!isBrowser()) return;
  try {
    await fetch('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // در بدترین حالت session cookie هم پاک می‌شود و Edge proxy به login ریدایرکت می‌کند.
  }
}

/** Refresh a little before tokenExpires so in-flight requests stay valid. */
const ACCESS_REFRESH_SKEW_MS = 15_000;

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
 */
export async function writeRealAuthTokens(tokens: NestLoginTokens): Promise<void> {
  _mem = {
    token: tokens.token,
    refreshToken: tokens.refreshToken,
    tokenExpires: tokens.tokenExpires,
  };
  setPresenceCookie();
  // هر دو توکن را httpOnly cookie می‌کنیم:
  // - karvita_rt: refresh token (برای rotation)
  // - karvita_at: access token (برای Authorization header در /api/auth/refresh، اگر Nest نیاز داشت)
  await persistRefreshTokenInCookie(tokens.refreshToken, tokens.token);
}

/**
 * logout یا 401 قطعی.
 * حافظهٔ ماژول و هر دو cookie را پاک می‌کند.
 */
export function clearRealAuthTokens(): void {
  _mem = null;
  clearPresenceCookie();
  void clearRefreshTokenCookie();
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
