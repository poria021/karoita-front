import type { AuthSurface } from '@/lib/real-auth-cookie';

/** مسیر refresh Nest بر اساس سطح سشن؛ ادمین نباید به refresh کاربر بخورد. */
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Nest گاهی `{ refreshToken }` و گاهی `{ data: { refreshToken } }` می‌فرستد.
 */
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
