import { RouteService } from '@/services/route.service';

/**
 * Post-auth landing path used by Edge proxy when role cannot be resolved.
 * Client flows MUST use `getPostLoginPath` so super_admin lands on
 * `RouteService.karvita.adminDashboard()` instead of this shared user dashboard.
 */
const DEFAULT_LOGIN_REDIRECT = RouteService.karvita.dashboard();

/**
 * Centralized authentication cookie name (rule 40, #3). Defaults to
 * Better-Auth's own session cookie during the migration phase; swap the
 * `NEXT_PUBLIC_AUTH_COOKIE_NAME` env var once NestJS issues its own
 * HTTP-only cookie. Never hardcode this literal name anywhere else.
 */
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'better-auth.session_token';

/**
 * Mock-only non-httpOnly marker for Edge `proxy.ts` (never a secret).
 * Real mode uses Better-Auth / Nest httpOnly cookies instead.
 */
const MOCK_SESSION_MARKER = 'karvita_mock_session';

export { DEFAULT_LOGIN_REDIRECT, AUTH_COOKIE_NAME, MOCK_SESSION_MARKER };
