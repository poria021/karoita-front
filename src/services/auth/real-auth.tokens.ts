import Cookies from 'js-cookie';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import type { NestLoginTokens } from '@/services/auth/nest-auth-mappers';

const REAL_TOKENS_STORAGE_KEY = 'karvita_real_auth_tokens';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readStoredTokens(): NestLoginTokens | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(REAL_TOKENS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NestLoginTokens>;
    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.tokenExpires !== 'number'
    ) {
      return null;
    }
    return {
      token: parsed.token,
      refreshToken: parsed.refreshToken,
      tokenExpires: parsed.tokenExpires,
    };
  } catch {
    return null;
  }
}

function setPresenceCookie(expiresAtMs: number): void {
  if (!isBrowser()) return;
  Cookies.set(AUTH_COOKIE_NAME, '1', {
    path: '/',
    expires: new Date(expiresAtMs),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function clearPresenceCookie(): void {
  if (!isBrowser()) return;
  Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
}

export function readRealAccessToken(): string | null {
  const tokens = readStoredTokens();
  if (!tokens) return null;
  if (tokens.tokenExpires <= Date.now()) {
    clearRealAuthTokens();
    return null;
  }
  return tokens.token;
}

export function readRealTokenExpiresAt(): string | null {
  const tokens = readStoredTokens();
  if (!tokens) return null;
  return new Date(tokens.tokenExpires).toISOString();
}

export function writeRealAuthTokens(tokens: NestLoginTokens): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(REAL_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  setPresenceCookie(tokens.tokenExpires);
}

export function clearRealAuthTokens(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(REAL_TOKENS_STORAGE_KEY);
  clearPresenceCookie();
}
