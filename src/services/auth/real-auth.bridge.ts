import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { apiClient, ApiClientError } from '@/services/api-client';
import type { Session, User } from '@/types/auth';

/**
 * Nest auth HTTP surface (rule 40 / 45).
 *
 * Contract (cookie session preferred — `apiClient` uses `credentials: 'include'`):
 * - `POST auth/login`     body `{ mobile, password }` → session + user
 * - `POST auth/register`  body `{ mobile }` → void / pending OTP
 * - `POST auth/logout`    → void
 * - `GET  auth/session`   → current session or 401
 *
 * Flip {@link NEST_AUTH_LIVE} when Nest routes exist. Until then every method
 * throws `REAL_MODE_NOT_IMPLEMENTED` after the API-URL guard.
 * UI gates ≠ authorization — Nest must re-validate every mutation.
 */

/** Set true only when Nest auth endpoints are deployed and verified. */
const NEST_AUTH_LIVE = false;

export const REAL_AUTH_PATHS = {
  login: 'auth/login',
  register: 'auth/register',
  logout: 'auth/logout',
  session: 'auth/session',
} as const;

type NestAuthUserPayload = {
  id: string;
  mobile: string;
  role: User['role'];
  firstName?: string;
  lastName?: string;
  approved?: boolean;
  docStatus?: User['docStatus'];
  hasPassword?: boolean;
};

type NestSessionPayload = {
  user: NestAuthUserPayload;
  expiresAt?: string;
};

function requireApiConfigured(surface: string): void {
  if (!apiClient.isConfigured) {
    throwRealModeNotImplemented(surface);
  }
}

function assertNestLive(surface: string): void {
  if (!NEST_AUTH_LIVE) {
    throwRealModeNotImplemented(surface);
  }
}

function mapNestUser(payload: NestAuthUserPayload): User {
  return {
    id: payload.id,
    mobile: payload.mobile,
    role: payload.role,
    firstName: payload.firstName ?? '',
    lastName: payload.lastName ?? '',
    approved: payload.approved ?? false,
    docStatus: payload.docStatus ?? 'not_submitted',
    hasPassword: payload.hasPassword ?? false,
  };
}

function extractSessionPayload(raw: unknown): NestSessionPayload {
  if (!raw || typeof raw !== 'object') {
    throw new ApiClientError('پاسخ نشست نامعتبر است.');
  }
  const record = raw as Record<string, unknown>;
  const data =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  const userRaw = data.user;
  if (!userRaw || typeof userRaw !== 'object') {
    throw new ApiClientError('پاسخ نشست فاقد کاربر است.');
  }
  const user = userRaw as NestAuthUserPayload;
  if (typeof user.id !== 'string' || typeof user.mobile !== 'string') {
    throw new ApiClientError('پاسخ نشست ناقص است.');
  }
  return {
    user,
    expiresAt:
      typeof data.expiresAt === 'string' ? data.expiresAt : undefined,
  };
}

/**
 * POST login — Nest sets httpOnly session cookie.
 * Throws `REAL_MODE_NOT_IMPLEMENTED` until Nest auth is marked live.
 */
export async function realLoginWithCredentials(
  mobile: string,
  password: string
): Promise<User> {
  requireApiConfigured('real-auth.bridge.login');
  assertNestLive('real-auth.bridge.login');
  const raw = await apiClient.postJson<unknown>(REAL_AUTH_PATHS.login, {
    mobile,
    password,
  });
  return mapNestUser(extractSessionPayload(raw).user);
}

export async function realRegister(mobile: string): Promise<void> {
  requireApiConfigured('real-auth.bridge.register');
  assertNestLive('real-auth.bridge.register');
  await apiClient.postJson(REAL_AUTH_PATHS.register, { mobile });
}

export async function realSignOut(): Promise<void> {
  requireApiConfigured('real-auth.bridge.logout');
  assertNestLive('real-auth.bridge.logout');
  await apiClient.postJson(REAL_AUTH_PATHS.logout, {});
}

/**
 * Fetch Nest session (httpOnly cookie). Call from effects only — not render.
 * Returns null on 401; throws on other errors / unwired Nest.
 */
export async function realFetchSession(): Promise<Session | null> {
  requireApiConfigured('real-auth.bridge.session');
  assertNestLive('real-auth.bridge.session');
  try {
    const raw = await apiClient.getJson<unknown>(REAL_AUTH_PATHS.session);
    const session = extractSessionPayload(raw);
    return {
      user: mapNestUser(session.user),
      // httpOnly — never mirror Nest session token into JS
      token: '',
      expiresAt:
        session.expiresAt ??
        new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}
