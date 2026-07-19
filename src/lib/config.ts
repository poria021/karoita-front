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

export { DEFAULT_LOGIN_REDIRECT, AUTH_COOKIE_NAME, MOCK_SESSION_MARKER };
