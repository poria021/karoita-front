/**
 * چرخهٔ توکن مرورگر: access در حافظهٔ ماژول این تب؛ refresh فقط کوکی httpOnly
 * که `POST /api/auth/refresh` می‌خواند. ky اینجا import نشود.
 */
import { isAuthPath, RouteService } from '@/services/route.service';
import { beginLeavingApp, waitForNextPaint } from '@/store/authTransition';
import { setRuntimeAuthBoot } from '@/store/sessionBoot';
import { useUserStore } from '@/store/useUserStore';

let browserRotateAccessPromise: Promise<string | null> | null = null;

async function rotateAccessTokenOnce(): Promise<string | null> {
  try {
    const { realRefreshToken } = await import(
      '@/services/auth/real/real-auth.bridge'
    );
    const session = await realRefreshToken();
    return session?.token ?? null;
  } catch {
    return null;
  }
}

/** یک promise در هر تب — چند ۴۰۱ همزمان فقط یک refresh به Route/Nest می‌زنند. */
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

export function bearerHeaders(token?: string): HeadersInit {
  if (!token) return {};
  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  };
}

/** Bearer صریح یا access حافظه؛ اینجا refresh نزن — OTP بدون سشن `/api/auth/refresh` الکی می‌زند. */
export async function resolveBearerToken(
  explicit?: string
): Promise<string | undefined> {
  if (explicit) return explicit;
  try {
    const { readRealAccessToken } = await import(
      '@/services/auth/real/real-auth.tokens'
    );
    return readRealAccessToken() ?? undefined;
  } catch {
    return undefined;
  }
}

let handlingUnauthorized = false;

/** ۴۰۱: سشن محلی پاک و به login؛ هم‌زمانی و صفحات auth را رد می‌کند. */
export async function handleUnauthorized(): Promise<void> {
  if (handlingUnauthorized || typeof window === 'undefined') return;

  if (isAuthPath(window.location.pathname)) {
    setRuntimeAuthBoot('unauthenticated');
    useUserStore.getState().setUser(null);
    return;
  }

  handlingUnauthorized = true;
  try {
    beginLeavingApp();
    await waitForNextPaint();
    setRuntimeAuthBoot('unauthenticated');
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

const AUTH_BOOTSTRAP_PATH =
  /(\/v1\/auth\/(logout|refresh|phone\/login|phone\/register|forgot|reset)|\/v1\/admin\/auth\/(refresh|phone\/login|logout)|\/admin\/auth\/(refresh|phone\/login|logout)|\/api\/auth\/(refresh|clear-tokens|set-tokens))(?:\/|$|\?)/;

/** ۴۰۱ روی login/refresh/logout را refresh نکن (حلقه). کل `/v1/admin/auth/` استثنا نشود — `me` ادمین باید refresh بگیرد. */
export function shouldSkipTokenRefresh(url: string): boolean {
  return AUTH_BOOTSTRAP_PATH.test(url);
}
