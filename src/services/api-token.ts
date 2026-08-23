/**
 * Browser-side token lifecycle: read access token, rotate on 401, handle logout.
 * Responsible for: token resolution, silent refresh, unauthorized side-effects.
 *
 * Intentionally free of ky/HTTP imports — only auth store + token storage.
 */
import { isAuthPath, RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

// ─── Token rotation ──────────────────────────────────────────────────────────

let browserRotateAccessPromise: Promise<string | null> | null = null;

async function rotateAccessTokenOnce(): Promise<string | null> {
  try {
    const { readRealRefreshToken } = await import(
      '@/services/auth/real-auth.tokens'
    );
    const refresh = readRealRefreshToken();
    if (!refresh) return null;
    const { realRefreshToken } = await import(
      '@/services/auth/real-auth.bridge'
    );
    const session = await realRefreshToken(refresh);
    return session?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Rotate the access token exactly once per browser tab — concurrent 401s share
 * one promise so only one refresh request hits Nest.
 */
export async function rotateRealAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return rotateAccessTokenOnce();
  }
  if (browserRotateAccessPromise) return browserRotateAccessPromise;

  browserRotateAccessPromise = rotateAccessTokenOnce().finally(() => {
    browserRotateAccessPromise = null;
  });

  return browserRotateAccessPromise;
}

// ─── Bearer resolution ────────────────────────────────────────────────────────

export function bearerHeaders(token?: string): HeadersInit {
  if (!token) return {};
  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  };
}

/**
 * Resolve bearer token: explicit > stored access > rotate via refresh.
 * Returns undefined when no token is available (mock mode / unauthenticated).
 */
export async function resolveBearerToken(
  explicit?: string
): Promise<string | undefined> {
  if (explicit) return explicit;
  try {
    const { readRealAccessToken, readRealRefreshToken } = await import(
      '@/services/auth/real-auth.tokens'
    );
    const access = readRealAccessToken();
    if (access) return access;
    if (!readRealRefreshToken()) return undefined;
    return (await rotateRealAccessToken()) ?? undefined;
  } catch {
    return undefined;
  }
}

// ─── Unauthorized handler ─────────────────────────────────────────────────────

let handlingUnauthorized = false;

/**
 * 401 side-effect: clear local session and redirect to login.
 * Guarded against concurrent calls and re-entrancy on auth pages.
 */
export async function handleUnauthorized(): Promise<void> {
  if (handlingUnauthorized || typeof window === 'undefined') return;

  if (isAuthPath(window.location.pathname)) {
    useUserStore.getState().setUser(null);
    return;
  }

  handlingUnauthorized = true;
  try {
    useUserStore.getState().setUser(null);
    const { AuthService } = await import('@/services/auth.service');
    await AuthService.logout().catch(() => undefined);
    if (!isAuthPath(window.location.pathname)) {
      window.location.assign(RouteService.auth.login());
    }
  } finally {
    handlingUnauthorized = false;
  }
}

// ─── Auth-bootstrap path guard ────────────────────────────────────────────────

const AUTH_BOOTSTRAP_PATH =
  /(\/v1\/auth\/(refresh|logout|phone\/login|phone\/register|forgot|reset)|\/admin\/auth\/)(?:\/|$|\?)/;

/**
 * Paths that must NOT trigger a token refresh on 401 — they ARE the auth
 * bootstrap flow; retrying them with a new token would loop forever.
 */
export function shouldSkipTokenRefresh(url: string): boolean {
  return AUTH_BOOTSTRAP_PATH.test(url);
}
