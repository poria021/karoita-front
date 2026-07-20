import { RouteService } from '@/services/route.service';

const DEFAULT_LOGIN_REDIRECT = RouteService.karvita.dashboard();

const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'karvita_session';

const MOCK_SESSION_MARKER = 'karvita_mock_session';

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
