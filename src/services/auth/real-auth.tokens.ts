import Cookies from 'js-cookie';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import type { NestLoginTokens } from '@/services/auth/nest-auth-mappers';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Access token — in-memory only (module-scope variable, browser tab lifetime).
 *
 * The refresh token NEVER enters client JS. It is written straight into an
 * httpOnly cookie by the server (`POST /api/auth/set-tokens`, see
 * `src/lib/real-auth-cookie.ts`) and only ever read back by another
 * server-side route (`POST /api/auth/refresh`). An XSS payload running in
 * this page can read `window`, `document.cookie`, `localStorage` and
 * `sessionStorage` — but has no API that can read an httpOnly cookie. That
 * closes the token-theft path a stored-token design leaves open.
 *
 * Trade-off: a hard reload/new tab loses the in-memory access token. This is
 * expected — `AuthService.refreshRealSession()` calls `/api/auth/refresh` on
 * app bootstrap (see `AppAuthGuard`), which mints a fresh access token from
 * the still-valid httpOnly cookie without asking the user to log in again.
 */
let memoryAccessToken: string | null = null;
let memoryAccessTokenExpires: number | null = null;

/** Refresh a little before Nest `tokenExpires` so in-flight requests stay valid. */
const ACCESS_REFRESH_SKEW_MS = 15_000;

/**
 * Session cookie (no `expires`), set by `document.cookie` — deliberately
 * NOT httpOnly. It carries no secret, just the literal string `"1"`, and
 * exists purely so `src/proxy.ts` (Edge) can cheaply decide whether to
 * redirect an anonymous visitor to `/login` before any React code runs.
 * It is never treated as an authorization source — see the comment on
 * `useUserStore` and `src/proxy.ts`.
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
 * Cheap client-side hint: "was this browser logged in before?" Used only to
 * decide whether it's worth round-tripping to `/api/auth/refresh` after a
 * reload — never used as an authorization decision (that's Nest's job, via
 * the httpOnly cookie it never gets to see).
 */
export function hasAuthPresence(): boolean {
  if (!isBrowser()) return false;
  return Cookies.get(AUTH_COOKIE_NAME) === '1';
}

/**
 * Ships the refresh token to the server exactly once, right after login, so
 * it can be written into the httpOnly cookie. The token lives only inside
 * this function's stack — it is never assigned to a module/module-level
 * variable, so there is nothing for injected client JS to read afterwards.
 */
async function persistRefreshTokenServerSide(refreshToken: string): Promise<void> {
  await fetch('/api/auth/set-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  });
}

export function peekRealAuthTokens(): { token: string; tokenExpires: number } | null {
  if (!memoryAccessToken || !memoryAccessTokenExpires) return null;
  return { token: memoryAccessToken, tokenExpires: memoryAccessTokenExpires };
}

export function readRealAccessToken(): string | null {
  if (!memoryAccessToken || !memoryAccessTokenExpires) return null;
  if (memoryAccessTokenExpires <= Date.now() + ACCESS_REFRESH_SKEW_MS) {
    return null;
  }
  return memoryAccessToken;
}

export function readRealTokenExpiresAt(): string | null {
  if (!memoryAccessTokenExpires) return null;
  return new Date(memoryAccessTokenExpires).toISOString();
}

/**
 * Stores the access token in memory (sync, available immediately) and hands
 * the refresh token to the httpOnly-cookie endpoint (awaited, so callers
 * that need the cookie to exist right away — e.g. before a reload — can
 * `await` this too; callers that don't care about that ordering can still
 * fire-and-forget with `void`).
 */
export async function writeRealAuthTokens(tokens: NestLoginTokens): Promise<void> {
  memoryAccessToken = tokens.token;
  memoryAccessTokenExpires = tokens.tokenExpires;
  setPresenceCookie();
  if (isBrowser()) {
    await persistRefreshTokenServerSide(tokens.refreshToken);
  }
}

export function clearRealAuthTokens(): void {
  memoryAccessToken = null;
  memoryAccessTokenExpires = null;
  clearPresenceCookie();
  if (isBrowser()) {
    void fetch('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
  }
}
