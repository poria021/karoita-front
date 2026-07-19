import { RouteService } from '@/services/route.service';

/**
 * Post-auth landing path used by Edge proxy when role cannot be resolved.
 * Client flows MUST use `getPostLoginPath` so super_admin lands on
 * `RouteService.karvita.adminDashboard()` instead of this shared user dashboard.
 */
const DEFAULT_LOGIN_REDIRECT = RouteService.karvita.dashboard();

/**
 * Nest httpOnly session cookie name (rule 40, #3).
 * Override with `NEXT_PUBLIC_AUTH_COOKIE_NAME` when the API issues a different name.
 */
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'karvita_session';

/**
 * Mock-only non-httpOnly marker for Edge `proxy.ts` (never a secret).
 * Real mode uses Nest httpOnly cookies instead.
 */
const MOCK_SESSION_MARKER = 'karvita_mock_session';

/**
 * Deploy surface for future split hostnames (user app vs admin subdomain).
 * - `user` (default): public login at `/auth/login`; admin-gate stays reachable
 * - `admin`: primary entry is `/auth/admin-gate`; `/auth/login` redirects there
 *
 * Unset / invalid → `user` so local DX matches today’s dual-route behavior.
 * Nest still authorizes — this only picks the entry chrome (rule 45).
 */
export type AppSurface = 'user' | 'admin';

function resolveAppSurface(): AppSurface {
  const raw = process.env.NEXT_PUBLIC_APP_SURFACE?.trim().toLowerCase();
  if (raw === 'admin') return 'admin';
  return 'user';
}

const APP_SURFACE: AppSurface = resolveAppSurface();

function isAdminAppSurface(): boolean {
  return APP_SURFACE === 'admin';
}

export {
  DEFAULT_LOGIN_REDIRECT,
  AUTH_COOKIE_NAME,
  MOCK_SESSION_MARKER,
  APP_SURFACE,
  isAdminAppSurface,
};
