import type { AuthSurface } from '@/lib/real-auth-cookie';

// Refresh URLs depend on the session surface; an admin session must not call the user refresh endpoint.
export const NEST_REFRESH_PATHS: Record<AuthSurface, string> = {
  user: 'v1/auth/refresh',
  admin: 'v1/admin/auth/refresh',
};

export const NEST_SESSION_PATHS: Record<AuthSurface, string> = {
  user: 'v1/auth/me',
  admin: 'v1/admin/auth/me',
};

export function resolveAuthSurface(raw: string | undefined): AuthSurface {
  return raw === 'admin' ? 'admin' : 'user';
}

export function isAuthSurface(raw: string | undefined): raw is AuthSurface {
  return raw === 'admin' || raw === 'user';
}

// Restore the session surface from the refresh response; do not guess a user surface.
export function echoedAuthSurface(raw: unknown): AuthSurface | null {
  if (!isRecord(raw)) return null;
  if (raw.surface === 'admin' || raw.surface === 'user') return raw.surface;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Nest may return refreshToken either at the top level or inside a nested data object.
export function extractRotatedRefreshToken(raw: unknown): string | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.refreshToken === 'string' && raw.refreshToken) {
    return raw.refreshToken;
  }
  if (
    isRecord(raw.data) &&
    typeof raw.data.refreshToken === 'string' &&
    raw.data.refreshToken
  ) {
    return raw.data.refreshToken;
  }
  return null;
}

export function unwrapRefreshPayloadData(
  payload: unknown
): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  if (isRecord(payload.data)) return payload.data;
  return payload;
}

export function accessTokenFromRefreshPayload(payload: unknown): string | null {
  const data = unwrapRefreshPayloadData(payload);
  if (!data) return null;
  return typeof data.token === 'string' ? data.token : null;
}
