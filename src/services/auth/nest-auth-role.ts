import type { UserRole } from '@/types/auth';

/**
 * Nest RoleDto.name values from Auth Swagger (AuthRegisterLoginDto.role).
 * FE roles stay in `@/types/auth`; this map is transport-only.
 */
export type NestRoleName =
  | 'student'
  | 'trainee'
  | 'mentor'
  | 'teacher'
  | 'school_admin'
  | 'manager'
  | 'admin';

export type NestRoleDto = {
  id: string;
  name: NestRoleName;
};

const FE_ROLE_TO_NEST_NAME: Partial<Record<UserRole, NestRoleName>> = {
  student: 'student',
  skill_learner: 'trainee',
  supervisor_professor: 'mentor',
  mentor_teacher: 'teacher',
  school_principal: 'school_admin',
};

const NEST_NAME_TO_FE_ROLE: Record<NestRoleName, UserRole> = {
  student: 'student',
  trainee: 'skill_learner',
  mentor: 'supervisor_professor',
  teacher: 'mentor_teacher',
  school_admin: 'school_principal',
  manager: 'faculty_role',
  admin: 'assistant_admin',
};

export function toNestRoleName(role: UserRole): NestRoleName {
  const nestName = FE_ROLE_TO_NEST_NAME[role];
  if (!nestName) {
    throw new Error('این نقش برای ثبت‌نام از طریق API پشتیبانی نمی‌شود.');
  }
  return nestName;
}

export function fromNestRoleName(name: string): UserRole {
  const role = NEST_NAME_TO_FE_ROLE[name as NestRoleName];
  if (!role) {
    throw new Error('نقش بازگشتی از سرور پشتیبانی نمی‌شود.');
  }
  return role;
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
