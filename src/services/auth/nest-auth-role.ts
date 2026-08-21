import type { UserRole } from '@/types/auth';

/**
 * Nest RoleDto.name values from Auth Swagger (AuthRegisterLoginDto.role).
 * FE roles stay in `@/types/auth`; this map is transport-only.
 *
 * Source: GET v1/auth/roles → { id: string; name: NestRoleName }[]
 * Verified against: https://backenddev.darkube.ir/docs — Auth tag.
 */
export type NestRoleName =
  // ── Self-registerable (shown in RegisterDetailsStep) ──
  | 'student'      // دانشجو
  | 'trainee'      // مهارت‌آموز
  | 'mentor'       // استاد راهنما
  | 'teacher'      // معلم راهنما
  | 'school_admin' // مدیر مدرسه
  // ── Admin / management (assigned by Nest, not self-registerable) ──
  | 'manager'      // مدیر دانشکده
  | 'admin'        // معاون ادمین
  // ── Higher-level roles (returned by Nest on GET /auth/me) ──
  | 'regional_admin'   // مدیر آموزش استانی / منطقه‌ای
  | 'provincial_admin' // مسئول دانشگاه استانی
  | 'central_org'      // سازمان مرکزی
  | 'super_admin';     // سوپر ادمین

export type NestRoleDto = {
  id: string;
  name: NestRoleName;
};

/** Live GET /auth/roles uses `title`; Swagger RoleDto uses `name`. */
export function nestRoleLabel(entry: Record<string, unknown>): string | null {
  if (typeof entry.name === 'string' && entry.name.trim()) return entry.name.trim();
  if (typeof entry.title === 'string' && entry.title.trim()) return entry.title.trim();
  return null;
}

/**
 * FE role → Nest RoleDto.name (used when POSTing to register/request-otp).
 * Only self-registerable roles are included — admin roles are assigned by Nest.
 */
const FE_ROLE_TO_NEST_NAME: Partial<Record<UserRole, NestRoleName>> = {
  student: 'student',
  skill_learner: 'trainee',
  supervisor_professor: 'mentor',
  mentor_teacher: 'teacher',
  school_principal: 'school_admin',
};

export function toNestRoleName(role: UserRole): NestRoleName {
  const nestName = FE_ROLE_TO_NEST_NAME[role];
  if (!nestName) {
    throw new Error('این نقش برای ثبت‌نام از طریق API پشتیبانی نمی‌شود.');
  }
  return nestName;
}

export function pickNestRoleDto(
  roles: readonly NestRoleDto[],
  role: UserRole
): NestRoleDto {
  const name = toNestRoleName(role);
  const match = roles.find((entry) => entry.name === name);
  if (!match?.id) {
    throw new Error(
      'شناسه نقش از سرور یافت نشد. لیست نقش‌ها را از GET /auth/roles بررسی کنید.'
    );
  }
  return { id: match.id, name: match.name };
}

/**
 * Nest RoleDto.name → FE UserRole (used when parsing GET /auth/me or LoginResponseDto).
 *
 * ⚠️ If Nest adds a new role, add it here AND in `@/types/auth.ts` — do NOT just add
 * to one side or the mapper will silently fall back to `assistant_admin`.
 */
const NEST_NAME_TO_FE_ROLE: Record<NestRoleName, UserRole> = {
  // Self-registerable
  student: 'student',
  trainee: 'skill_learner',
  mentor: 'supervisor_professor',
  teacher: 'mentor_teacher',
  school_admin: 'school_principal',
  // Admin / management
  manager: 'faculty_role',
  admin: 'assistant_admin',
  // Higher-level (assigned by Nest)
  regional_admin: 'regional_edu_admin',
  provincial_admin: 'provincial_university',
  central_org: 'central_organization',
  super_admin: 'super_admin',
};

/**
 * Maps a Nest role name string to a FE `UserRole`.
 *
 * Defensive: unknown role names log a warning and fall back to `assistant_admin`
 * rather than throwing, so a new Nest role doesn’t crash the login flow for all users.
 * Update `NEST_NAME_TO_FE_ROLE` and `@/types/auth.ts` when a new Nest role ships.
 */
export function fromNestRoleName(name: string): UserRole {
  const mapped = NEST_NAME_TO_FE_ROLE[name as NestRoleName];
  if (!mapped) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[nest-auth-role] نقش ناشناخته از Nest: «${name}». به NEST_NAME_TO_FE_ROLE اضافه کنید.`
      );
    }
    // Fail-open with lowest-privilege admin role to avoid crashing the auth flow.
    return 'assistant_admin';
  }
  return mapped;
}
