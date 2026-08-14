import { ApiClientError } from '@/services/api-client';
import { fromNestRoleName } from '@/services/auth/nest-auth-role';
import type { DocStatus, Session, User, UserRole } from '@/types/auth';

type NestLoginResponse = {
  token: string;
  refreshToken?: string;
  tokenExpires: number;
  user: User;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapData(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new ApiClientError('پاسخ احراز هویت نامعتبر است.');
  }
  if (isRecord(raw.data)) return raw.data;
  return raw;
}

/** Nest may send 9xxxxxxxxx, 09xxxxxxxxx, or 989xxxxxxxxx — FE keeps 9xxxxxxxxx. */
export function nestPhoneToMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length >= 12) return digits.slice(2, 12);
  if (digits.startsWith('0') && digits.length >= 11) return digits.slice(1, 11);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function mapNestDocStatus(value: unknown): DocStatus {
  if (typeof value !== 'string') return 'not_submitted';
  switch (value.toUpperCase()) {
    case 'PENDING':
      return 'pending_admin';
    case 'CONFIRM':
      return 'approved';
    case 'REJECT':
      return 'rejected';
    case 'NOTINIT':
    default:
      return 'not_submitted';
  }
}

function resolveNestRole(rawRole: unknown): UserRole {
  if (typeof rawRole === 'string') return fromNestRoleName(rawRole);
  if (isRecord(rawRole) && typeof rawRole.name === 'string') {
    return fromNestRoleName(rawRole.name);
  }
  throw new ApiClientError('پاسخ کاربر فاقد نقش معتبر است.');
}

/**
 * Map Nest Auth `User` (phone + Role object) → FE `User` (mobile + UserRole).
 */
export function mapNestAuthUser(raw: unknown): User {
  if (!isRecord(raw)) {
    throw new ApiClientError('پاسخ کاربر نامعتبر است.');
  }

  const id = raw.id;
  const phone =
    typeof raw.phone === 'string'
      ? raw.phone
      : typeof raw.mobile === 'string'
        ? raw.mobile
        : null;

  if (typeof id !== 'string' || !phone) {
    throw new ApiClientError('پاسخ کاربر ناقص است.');
  }

  const statusName =
    isRecord(raw.status) && typeof raw.status.name === 'string'
      ? raw.status.name.toLowerCase()
      : null;

  return {
    id,
    mobile: nestPhoneToMobile(phone),
    role: resolveNestRole(raw.role),
    firstName: typeof raw.firstName === 'string' ? raw.firstName : '',
    lastName: typeof raw.lastName === 'string' ? raw.lastName : '',
    approved: statusName === 'active' || raw.approved === true,
    docStatus: mapNestDocStatus(raw.documentStatus ?? raw.docStatus),
    hasPassword:
      typeof raw.hasPassword === 'boolean' ? raw.hasPassword : undefined,
  };
}

/** Nest `tokenExpires` may be epoch ms, epoch seconds, or TTL ms. */
export function nestTokenExpiresAt(tokenExpires: number): string {
  const now = Date.now();
  if (tokenExpires > 1e12) return new Date(tokenExpires).toISOString();
  if (tokenExpires > 1e9) return new Date(tokenExpires * 1000).toISOString();
  return new Date(now + Math.max(tokenExpires, 60_000)).toISOString();
}

/**
 * Parse Nest `LoginResponseDto`: `{ token, refreshToken, tokenExpires, user }`.
 */
export function extractNestLoginResponse(raw: unknown): NestLoginResponse & {
  refreshToken?: string;
} {
  const data = unwrapData(raw);
  const token = data.token;
  const tokenExpires = data.tokenExpires;
  const userRaw = data.user;

  if (typeof token !== 'string' || token.length === 0) {
    throw new ApiClientError('پاسخ ورود فاقد توکن است.');
  }
  if (typeof tokenExpires !== 'number' || !Number.isFinite(tokenExpires)) {
    throw new ApiClientError('پاسخ ورود فاقد زمان انقضا است.');
  }

  return {
    token,
    refreshToken:
      typeof data.refreshToken === 'string' ? data.refreshToken : undefined,
    tokenExpires,
    user: mapNestAuthUser(userRaw),
  };
}

export function sessionFromNestLogin(raw: unknown): Session & {
  refreshToken?: string;
} {
  const login = extractNestLoginResponse(raw);
  return {
    user: login.user,
    token: login.token,
    expiresAt: nestTokenExpiresAt(login.tokenExpires),
    refreshToken: login.refreshToken,
  };
}

/** GET /auth/me may return User directly (or `{ data: User }`). */
export function extractNestMeUser(raw: unknown): User {
  const data = unwrapData(raw);
  if (isRecord(data.user)) return mapNestAuthUser(data.user);
  return mapNestAuthUser(data);
}
