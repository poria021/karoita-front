import { ApiClientError } from '@/services/api-client';
import { fromNestRoleName } from '@/services/auth/nest-auth-role';
import type { DocStatus, Session, User } from '@/types/auth';

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

/**
 * شماره موبایل / phone رو از پاسخ Nest می‌خونه.
 *
 * برخی endpoint‌های Nest (از جمله PATCH /api/v1/users/{id}) شماره رو
 * در پاسخ برنمی‌گردونن — در این حالت به‌جای throw، رشته خالی برمی‌گردونیم
 * تا عملیات approve/reject کامل بشه. برای لاگین/رجیستر همچنان باید
 * fallbackMobile پاس بشه.
 */
function readPhone(user: Record<string, unknown>, fallbackMobile?: string): string {
  if (typeof user.phone === 'string' && user.phone.trim()) return user.phone.trim();
  if (typeof user.mobile === 'string' && user.mobile.trim()) return user.mobile.trim();
  if (fallbackMobile && fallbackMobile.trim()) return fallbackMobile.trim();
  // برای endpoint‌هایی که phone رو برنمی‌گردونن (مثل PATCH users/{id})
  // به‌جای throw کردن، رشته خالی برمیگردونیم.
  return '';
}

function readRole(user: Record<string, unknown>): User['role'] {
  if (typeof user.role === 'string') {
    return fromNestRoleName(user.role);
  }
  if (isRecord(user.role) && typeof user.role.name === 'string') {
    return fromNestRoleName(user.role.name);
  }
  if (isRecord(user.role) && typeof user.role.title === 'string') {
    return fromNestRoleName(user.role.title);
  }
  throw new ApiClientError('پاسخ کاربر فاقد نقش معتبر است.');
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * بک‌اند آرایه‌ای از آبجکت با فرمت {_id, title} یا {id, title} یا string ساده
 * برمی‌گردونه — این تابع title هر آیتم رو استخراج می‌کنه.
 */
function readOrgArray(value: unknown): string[] | undefined {
  // آرایه‌ای از آبجکت: [{_id, title}, ...]
  if (Array.isArray(value) && value.length > 0) {
    const titles = value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (isRecord(item)) {
          const title = item.title ?? item.name ?? item.label;
          return typeof title === 'string' ? title.trim() : '';
        }
        return '';
      })
      .filter(Boolean);
    return titles.length > 0 ? titles : undefined;
  }
  // آبجکت تکی: {_id, title}
  if (isRecord(value)) {
    const title = value.title ?? value.name ?? value.label;
    const str = typeof title === 'string' ? title.trim() : '';
    return str ? [str] : undefined;
  }
  // string ساده
  const str = asOptionalString(value);
  return str ? [str] : undefined;
}

function readOrgFields(user: Record<string, unknown>): Pick<
  User,
  'province' | 'college' | 'major' | 'city' | 'district' | 'school'
> {
  return {
    province: readOrgArray(user.province),
    college:  readOrgArray(user.university),
    major:    asOptionalString(user.degree
      ? (isRecord(user.degree) ? (user.degree.title ?? user.degree.name) : user.degree)
      : undefined
    ),
    city:     readOrgArray(user.city),
    district: readOrgArray(user.educationalDistrict),
    school:   readOrgArray(user.school),
  };
}

function readRoleIdentifier(
  role: User['role'],
  uniqueId: string | undefined
): Pick<User, 'studentId' | 'skillCode' | 'personalCode'> {
  if (!uniqueId) return {};
  switch (role) {
    case 'student':
      return { studentId: uniqueId };
    case 'skill_learner':
      return { skillCode: uniqueId };
    case 'supervisor_professor':
    case 'mentor_teacher':
    case 'school_principal':
    case 'regional_edu_admin':
      return { personalCode: uniqueId };
    default:
      return {};
  }
}

/**
 * Maps a Nest User DTO (from any endpoint) → FE `User`.
 *
 * استفاده می‌شه برای:
 * - GET  /api/v1/users  (لیست)
 * - GET  /api/v1/users/{id}
 * - PATCH /api/v1/users/{id}  (approve / reject)
 * - GET  /auth/me
 */
export function mapNestAuthUser(raw: unknown, fallbackMobile?: string): User {
  if (!isRecord(raw) || typeof raw.id !== 'string') {
    throw new ApiClientError('پاسخ کاربر نامعتبر است.');
  }

  // documentStatus مستقیم یا داخل status.name
  const documentStatus =
    typeof raw.documentStatus === 'string'
      ? raw.documentStatus
      : isRecord(raw.status) && typeof raw.status.name === 'string'
        ? raw.status.name
        : undefined;

  const role = readRole(raw);

  // photo.path از Nest یک URL کامل S3 است — مستقیم قابل استفاده در <img src>
  const photoUrl =
    isRecord(raw.photo) && typeof raw.photo.path === 'string'
      ? raw.photo.path
      : undefined;

  return {
    id: raw.id,
    mobile: readPhone(raw, fallbackMobile),
    role,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : '',
    lastName: typeof raw.lastName === 'string' ? raw.lastName : '',
    approved:
      typeof raw.approved === 'boolean'
        ? raw.approved
        : mapNestDocStatus(documentStatus) === 'approved',
    docStatus: mapNestDocStatus(documentStatus),
    hasPassword: typeof raw.hasPassword === 'boolean' ? raw.hasPassword : true,
    ...(photoUrl ? { docUrl: photoUrl } : {}),
    ...readOrgFields(raw),
    ...readRoleIdentifier(role, asOptionalString(raw.userUniqueId)),
  };
}

export type NestLoginTokens = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
};

/**
 * Nest LoginResponseDto: `{ token, refreshToken, tokenExpires, user }`.
 */
export function extractNestLoginResponse(
  raw: unknown,
  fallbackMobile?: string
): {
  tokens: NestLoginTokens;
  user: User;
  expiresAt: string;
} {
  const data = unwrapData(raw);
  const token = data.token;
  const refreshToken = data.refreshToken;
  const tokenExpires = data.tokenExpires;

  if (
    typeof token !== 'string' ||
    !token ||
    typeof refreshToken !== 'string' ||
    typeof tokenExpires !== 'number'
  ) {
    throw new ApiClientError('پاسخ ورود فاقد توکن معتبر است.');
  }

  // بک‌اند ثبت‌نام: آبجکت کاربر را در «newUser» برمی‌گرداند، نه «user»
  const rawUser = isRecord(data.user) ? data.user : data.newUser;
  const user = mapNestAuthUser(rawUser, fallbackMobile);
  const expiresAt = new Date(tokenExpires).toISOString();

  return {
    tokens: { token, refreshToken, tokenExpires },
    user,
    expiresAt,
  };
}

export function extractNestRefreshTokens(raw: unknown): NestLoginTokens {
  const data = unwrapData(raw);
  const token = data.token;
  const refreshToken = data.refreshToken;
  const tokenExpires = data.tokenExpires;

  if (
    typeof token !== 'string' ||
    !token ||
    typeof refreshToken !== 'string' ||
    typeof tokenExpires !== 'number'
  ) {
    throw new ApiClientError('پاسخ تمدید نشست فاقد توکن معتبر است.');
  }

  return { token, refreshToken, tokenExpires };
}

export function toSessionFromNestLogin(raw: unknown, fallbackMobile?: string): Session {
  const parsed = extractNestLoginResponse(raw, fallbackMobile);
  return {
    user: parsed.user,
    token: parsed.tokens.token,
    expiresAt: parsed.expiresAt,
  };
}

/** True when payload looks like LoginResponseDto (register verify may be empty 201). */
export function looksLikeNestLoginResponse(raw: unknown): boolean {
  if (!isRecord(raw)) return false;
  const data = isRecord(raw.data) ? raw.data : raw;
  return (
    typeof data.token === 'string' &&
    (isRecord(data.user) || isRecord(data.newUser))
  );
}

/**
 * True when payload looks like Admin LoginResponseDto
 * { token, refreshToken, tokenExpires, admin: { id, fname, lname, phone, role, ... } }
 */
export function looksLikeNestAdminLoginResponse(raw: unknown): boolean {
  if (!isRecord(raw)) return false;
  const data = isRecord(raw.data) ? raw.data : raw;
  return typeof data.token === 'string' && isRecord(data.admin);
}

/**
 * Maps Admin response `{ id, fname, lname, phone, role, status }` → FE `User`.
 * Admin API uses fname/lname instead of firstName/lastName,
 * and role is a plain string (e.g. 'admin') not a RoleDto object.
 */
export function mapNestAdminUser(raw: unknown, fallbackMobile?: string): User {
  if (!isRecord(raw) || typeof raw.id !== 'string') {
    throw new ApiClientError('پاسخ ادمین نامعتبر است.');
  }

  const mobile = readPhone(raw, fallbackMobile);

  let role: User['role'] = 'super_admin';
  if (typeof raw.role === 'string') {
    role = fromNestRoleName(raw.role);
  }

  const isActive = isRecord(raw.status) && raw.status.name === 'active';

  return {
    id: raw.id,
    mobile,
    role,
    firstName: typeof raw.fname === 'string' ? raw.fname : '',
    lastName:  typeof raw.lname === 'string' ? raw.lname : '',
    approved: isActive,
    docStatus: isActive ? 'approved' : 'not_submitted',
    hasPassword: true,
  };
}

/**
 * Extracts tokens + admin user from Admin LoginResponseDto:
 * { token, refreshToken, tokenExpires, admin: { ... } }
 */
export function extractNestAdminLoginResponse(
  raw: unknown,
  fallbackMobile?: string
): {
  tokens: NestLoginTokens;
  user: User;
  expiresAt: string;
} {
  const data = unwrapData(raw);
  const token = data.token;
  const refreshToken = data.refreshToken;
  const tokenExpires = data.tokenExpires;

  if (
    typeof token !== 'string' ||
    !token ||
    typeof refreshToken !== 'string' ||
    typeof tokenExpires !== 'number'
  ) {
    throw new ApiClientError('پاسخ ورود ادمین فاقد توکن معتبر است.');
  }

  const user = mapNestAdminUser(data.admin, fallbackMobile);
  const expiresAt = new Date(tokenExpires).toISOString();

  return {
    tokens: { token, refreshToken, tokenExpires },
    user,
    expiresAt,
  };
}
