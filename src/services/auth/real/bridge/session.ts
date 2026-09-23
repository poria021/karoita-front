import { apiClient, ApiClientError } from '@/services/api-client';
import { dispatchSessionToStore } from '@/services/auth/dispatch-session';
import {
  extractNestAdminLoginResponse,
  extractNestLoginResponse,
  extractNestRefreshTokens,
  looksLikeNestAdminLoginResponse,
  looksLikeNestLoginResponse,
  mapNestAdminUser,
  mapNestAuthUser,
  toSessionFromNestLogin,
} from '@/services/auth/real/nest-auth-mappers';
import { echoedAuthSurface } from '@/services/auth/real/refresh-route-helpers';
import {
  clearRealAuthTokens,
  readRealAccessToken,
  readRealTokenExpiresAt,
  writeRealAuthTokens,
} from '@/services/auth/real/real-auth.tokens';
import {
  SessionTransientError,
  TRANSIENT_RESTORE_MESSAGE,
} from '@/services/auth/session-errors';
import { useUserStore } from '@/store/useUserStore';
import type { Session } from '@/types/auth';

import { currentSurface, guard, REAL_AUTH_PATHS } from './shared';

export {
  SessionTransientError,
  isSessionTransientError,
} from '@/services/auth/session-errors';

let refreshInFlight: Promise<Session | null> | null = null;

export type SessionFailureKind = 'dead' | 'transient';

/** نشست مرده است — باید خروج و پاک کردن presence. */
export class SessionDeadError extends Error {
  readonly kind = 'dead' as const;

  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'SessionDeadError';
  }
}

export function isDeadSessionHttpStatus(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

export function toSessionTransientError(error: unknown): SessionTransientError {
  if (error instanceof SessionTransientError) return error;
  const message =
    error instanceof ApiClientError && error.message
      ? error.message
      : TRANSIENT_RESTORE_MESSAGE;
  return new SessionTransientError(message, error);
}

function markSessionDead(): null {
  clearRealAuthTokens();
  dispatchSessionToStore(null);
  return null;
}

export function realRefreshToken(_refreshToken?: string): Promise<Session | null> {
  void _refreshToken;
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = performRealRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

// اگه VPN یه connection رو hang کنه بدون RST، fetch بدون signal می‌تونه دقیقه‌ها منتظر بمونه
// و AppAuthGuard تو حالت pending بی‌نهایت گیر می‌کنه.
const REFRESH_TIMEOUT_MS = 15_000;

async function performRealRefresh(): Promise<Session | null> {
  try {
    const existingMobile = useUserStore.getState().activeUser?.mobile;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    // رفرش باطل → پاکسازی فوری (کلاس الف)
    if (isDeadSessionHttpStatus(res.status)) {
      return markSessionDead();
    }

    if (!res.ok) {
      throw new SessionTransientError(TRANSIENT_RESTORE_MESSAGE, res.status);
    }

    const raw: unknown = await res.json();

    // Route قبلاً `/auth/me` را ضمیمه کرده — اینجا فقط parse
    if (looksLikeNestAdminLoginResponse(raw)) {
      const parsed = extractNestAdminLoginResponse(raw, existingMobile);
      await writeRealAuthTokens(parsed.tokens, 'admin');
      const session: Session = { user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt };
      dispatchSessionToStore(session);
      return session;
    }

    if (looksLikeNestLoginResponse(raw)) {
      const parsed = extractNestLoginResponse(raw, existingMobile);
      await writeRealAuthTokens(parsed.tokens, 'user');
      const session: Session = { user: parsed.user, token: parsed.tokens.token, expiresAt: parsed.expiresAt };
      dispatchSessionToStore(session);
      return session;
    }

    // fallback: Nest فقط توکن داد و `me` در Route شکست خورد — سطح را حدس نزن
    try {
      const tokens = extractNestRefreshTokens(raw);
      const surface = echoedAuthSurface(raw);
      if (!surface) {
        return markSessionDead();
      }
      await writeRealAuthTokens(tokens, surface);

      const fallbackSession = await realFetchSession(existingMobile, tokens.token);
      if (fallbackSession) {
        dispatchSessionToStore(fallbackSession);
        return fallbackSession;
      }
    } catch (error) {
      if (error instanceof ApiClientError && isDeadSessionHttpStatus(error.status)) {
        return markSessionDead();
      }
      throw toSessionTransientError(error);
    }

    return markSessionDead();
  } catch (error) {
    if (error instanceof SessionTransientError) throw error;
    if (error instanceof SessionDeadError) {
      return markSessionDead();
    }
    if (error instanceof ApiClientError && isDeadSessionHttpStatus(error.status)) {
      return markSessionDead();
    }
    throw toSessionTransientError(error);
  }
}

export async function realFetchSession(
  fallbackMobile?: string,
  explicitAccessToken?: string
): Promise<Session | null> {
  guard('real-auth.bridge.session');
  const mobileFallback = fallbackMobile ?? useUserStore.getState().activeUser?.mobile;
  const surface = currentSurface();

  // اینجا refresh نزن — caller باید token بدهد؛ OTP بدون سشن refresh الکی می‌زند
  const accessToken = explicitAccessToken ?? readRealAccessToken();
  if (!accessToken || !surface) return null;

  try {
    const sessionPath = surface === 'admin' ? REAL_AUTH_PATHS.adminSession : REAL_AUTH_PATHS.session;
    const raw = await apiClient.getJson<unknown>(sessionPath, accessToken);

    if (looksLikeNestAdminLoginResponse(raw)) {
      return {
        user: extractNestAdminLoginResponse(raw, mobileFallback).user,
        token: accessToken,
        expiresAt: readRealTokenExpiresAt() ?? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (looksLikeNestLoginResponse(raw)) return toSessionFromNestLogin(raw, mobileFallback);

    // GET `me` خام: شیء با id، بدون پوشش login
    const payload =
      raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data
        ? (raw as { data: unknown }).data
        : raw;

    const user = surface === 'admin'
      ? mapNestAdminUser(payload, mobileFallback)
      : mapNestAuthUser(payload, mobileFallback);

    return {
      user,
      token: accessToken,
      expiresAt: readRealTokenExpiresAt() ?? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}
