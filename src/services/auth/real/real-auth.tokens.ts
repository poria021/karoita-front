/**
 * Real-mode token lifecycle: access stays in memory, refresh stays in an httpOnly cookie.
 * Avoid sessionStorage because it is exposed to XSS.
 */

import Cookies from 'js-cookie';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import {
  REAL_SURFACE_COOKIE_NAME,
  type AuthSurface,
} from '@/lib/real-auth-cookie';
import type { NestLoginTokens } from '@/services/auth/real/nest-auth-mappers';

interface MemoryTokens {
  token: string;
  /** رفرش در حافظه فقط برای پاس به `/api/auth/refresh`؛ کلاینت مستقیم به Nest نزند. */
  refreshToken: string;
  tokenExpires: number;
  surface: AuthSurface;
  /** زمان نوشتن توکن (epoch ms) — برای تشخیص freshness و جلوگیری از /auth/me اضافه. */
  writtenAt: number;
}

let _mem: MemoryTokens | null = null;
// شمارندهٔ نسل هر نوشتن — برای تشخیص اینکه آیا یک `writeRealAuthTokens` دیگر
// (رفرش پس‌زمینه/لاگین جدید) بین شروع و شکستِ این فراخوانی، سشن را عوض کرده.
let _writeGeneration = 0;

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

// A value-less cookie is enough for the edge proxy to recognize the session presence.
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

// Wrap refresh-cookie write failures without coupling this module to a specific HTTP client.
export class AuthSessionPersistError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AuthSessionPersistError';
  }
}

const SET_TOKENS_MAX_ATTEMPTS = 3;
// Backoff between refresh-cookie write attempts.
const SET_TOKENS_RETRY_DELAYS_MS = [300, 900];
// Keep each write attempt bounded so a stuck login request does not hang indefinitely.
const SET_TOKENS_ATTEMPT_TIMEOUT_MS = 8_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** یک POST به `/api/auth/set-tokens` با timeout جدا. */
async function requestSetTokensOnce(
  refreshToken: string,
  surface: AuthSurface,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SET_TOKENS_ATTEMPT_TIMEOUT_MS);
  try {
    return await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, surface }),
      credentials: 'include',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Refresh-cookie persistence is required for a valid session; if it fails, the app must stop with a clear error.
async function persistRefreshTokenInCookie(
  refreshToken: string,
  surface: AuthSurface,
): Promise<void> {
  if (!isBrowser()) return;

  let lastError: unknown;

  for (let attempt = 0; attempt < SET_TOKENS_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(SET_TOKENS_RETRY_DELAYS_MS[attempt - 1] ?? 900);
    }
    try {
      const res = await requestSetTokensOnce(refreshToken, surface);
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

// Clear the refresh and surface cookies via the route so the server can remove the httpOnly values.
async function clearRefreshTokenCookie(): Promise<void> {
  if (!isBrowser()) return;
  // باقیماندهٔ کوکی غیر-httpOnly قدیمی
  Cookies.remove(REAL_SURFACE_COOKIE_NAME, { path: '/' });
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8_000);
    try {
      await fetch('/api/auth/clear-tokens', {
        method: 'POST',
        credentials: 'include',
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(t);
    }
  } catch {
    // اگر Route نرسید یا timeout خورد، presence cookie پایین‌تر پاک می‌شود و proxy به login می‌فرستد.
  }
}

// Treat a token as expired before the 401 threshold so the app refreshes early.
const ACCESS_REFRESH_SKEW_MS = 60_000;

// After login or refresh, keep access in memory and store the refresh token in httpOnly cookies.
export async function writeRealAuthTokens(
  tokens: NestLoginTokens,
  surface: AuthSurface,
): Promise<void> {
  warnIfTokenExpiresLooksLikeSeconds(tokens.tokenExpires);
  const generation = ++_writeGeneration;
  _mem = {
    token: tokens.token,
    refreshToken: tokens.refreshToken,
    tokenExpires: tokens.tokenExpires,
    surface,
    writtenAt: Date.now(),
  };
  setPresenceCookie();

  try {
    // فقط `karvita_rt` + `karvita_surface` httpOnly؛ access در حافظه می‌ماند
    await persistRefreshTokenInCookie(tokens.refreshToken, surface);
  } catch (error) {
    // rollback: اگر set-tokens جزئی موفق بود، clear-tokens هم بزن — ولی فقط
    // اگر در همین فاصله یک writeRealAuthTokens دیگر (رفرش پس‌زمینه/لاگین
    // جدید) سشن را عوض نکرده باشد؛ وگرنه پاک کردن اینجا سشن معتبر جدید را
    // (هم حافظه هم کوکی httpOnly سرور) از بین می‌برد، نه سشن خودمان را.
    if (_writeGeneration === generation) {
      clearRealAuthTokens();
    }
    throw error;
  }
}

// On logout or a hard 401, clear the in-memory session immediately and remove the server cookie asynchronously.
export function clearRealAuthTokens(): void {
  _mem = null;           // فوری تا request جدید token نگیرد
  clearPresenceCookie(); // فوری تا proxy سشن نبیند
  void clearRefreshTokenCookie(); // httpOnly فقط از سرور پاک می‌شود
}

// Return null when the access token is effectively expired by the skew window.
export function readRealAccessToken(): string | null {
  if (!_mem) return null;
  if (_mem.tokenExpires <= Date.now() + ACCESS_REFRESH_SKEW_MS) return null;
  return _mem.token;
}

// True if the token was written less than windowMs ago — caller can skip /auth/me
// when both this and peekSession() return truthy (token just issued, store still valid).
export function isRealTokenFresh(windowMs: number): boolean {
  if (!_mem) return false;
  return Date.now() - _mem.writtenAt < windowMs;
}

// The refresh token is kept in memory only for the route refresh flow; a fresh tab reads it from the cookie instead.
export function readRealRefreshToken(): string | null {
  return _mem?.refreshToken ?? null;
}

// Format the access-token expiry as ISO for UI display and comparisons.
export function readRealTokenExpiresAt(): string | null {
  if (!_mem) return null;
  return new Date(_mem.tokenExpires).toISOString();
}

// Inspect the current in-memory session without triggering any side effects; null means the refresh route may need to restore it.
export function peekRealAuthTokens(): NestLoginTokens | null {
  return _mem
    ? { token: _mem.token, refreshToken: _mem.refreshToken, tokenExpires: _mem.tokenExpires }
    : null;
}

// The session surface comes from memory; after a page refresh it stays null until a successful restore.
export function readRealAuthSurface(): AuthSurface | null {
  return _mem?.surface ?? null;
}
