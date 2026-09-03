import type { UserRole } from '@/types/auth';
import type { StaffAdminRole } from '@/types/role-taxonomy';

export {
  isStaffAdminRole,
  type StaffAdminRole,
} from '@/types/role-taxonomy';

// Role names returned by Nest's auth API.
export type NestRoleName =
  | 'student'
  | 'trainee'
  | 'mentor'
  | 'teacher'
  | 'school_admin'
  | 'manager'
  | 'admin'
  | 'superadmin'
  | 'regional_admin'
  | 'provincial_admin'
  | 'central_org'
  | 'super_admin';

export type NestRoleDto = {
  id: string;
  name: NestRoleName;
};

// Some Nest role lists expose `title` instead of `name`; keep both accepted.
export function nestRoleLabel(entry: Record<string, unknown>): string | null {
  if (typeof entry.name === 'string' && entry.name.trim()) return entry.name.trim();
  if (typeof entry.title === 'string' && entry.title.trim()) return entry.title.trim();
  return null;
}

// Front-end roles used by public auth flows.
const FE_ROLE_TO_NEST_NAME: Partial<Record<UserRole, NestRoleName>> = {
  student: 'student',
  skill_learner: 'trainee',
  supervisor_professor: 'mentor',
  mentor_teacher: 'teacher',
  school_principal: 'school_admin',
};

// Admin account role mapping for Nest's admin endpoints.
export function toNestAdminAccountRole(
  role: StaffAdminRole
): Extract<NestRoleName, 'admin' | 'superadmin'> {
  return role === 'super_admin' ? 'superadmin' : 'admin';
}

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

// Maps roles returned by /auth/me back into the front-end role union.
const NEST_NAME_TO_FE_ROLE: Record<NestRoleName, UserRole> = {
  student: 'student',
  trainee: 'skill_learner',
  mentor: 'supervisor_professor',
  teacher: 'mentor_teacher',
  school_admin: 'school_principal',
  manager: 'faculty_role',
  admin: 'assistant_admin',
  superadmin: 'super_admin',
  regional_admin: 'regional_edu_admin',
  provincial_admin: 'provincial_university',
  central_org: 'central_organization',
  super_admin: 'super_admin',
};

// Unknown roles should not block login; it is safer to fall back to the least privileged admin role.
export function fromNestRoleName(name: string): UserRole {
  const mapped = NEST_NAME_TO_FE_ROLE[name as NestRoleName];
  if (!mapped) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[nest-auth-role] نقش ناشناخته از Nest: «${name}». به NEST_NAME_TO_FE_ROLE اضافه کنید.`
      );
    }
    return 'assistant_admin';
  }
  return mapped;
}
