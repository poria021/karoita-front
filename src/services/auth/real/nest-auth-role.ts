import type { UserRole } from '@/types/auth';
import type { StaffAdminRole } from '@/types/role-taxonomy';

export {
  isStaffAdminRole,
  type StaffAdminRole,
} from '@/types/role-taxonomy';

/** نام نقش Nest از Swagger (`RoleDto.name`)؛ نقش فرانت در `@/types/auth` بماند — فقط حمل‌ونقل. */
export type NestRoleName =
  | 'student'      // دانشجو
  | 'trainee'      // مهارت‌آموز
  | 'mentor'       // استاد راهنما
  | 'teacher'      // معلم راهنما
  | 'school_admin' // مدیر مدرسه
  | 'manager'      // مدیر دانشکده
  | 'admin'        // معاون ادمین
  | 'superadmin'  // سوپر ادمین (پاسخ Admin API)
  | 'regional_admin'   // مدیر آموزش استانی / منطقه‌ای
  | 'provincial_admin' // مسئول دانشگاه استانی
  | 'central_org'      // سازمان مرکزی
  | 'super_admin';     // سوپر ادمین

export type NestRoleDto = {
  id: string;
  name: NestRoleName;
};

/** لایو `GET /auth/roles` فیلد `title` دارد؛ Swagger `name`. */
export function nestRoleLabel(entry: Record<string, unknown>): string | null {
  if (typeof entry.name === 'string' && entry.name.trim()) return entry.name.trim();
  if (typeof entry.title === 'string' && entry.title.trim()) return entry.title.trim();
  return null;
}

/** نقش فرانت → `RoleDto.name` برای register/request-otp؛ نقش ادمین را Nest می‌گذارد. */
const FE_ROLE_TO_NEST_NAME: Partial<Record<UserRole, NestRoleName>> = {
  student: 'student',
  skill_learner: 'trainee',
  supervisor_professor: 'mentor',
  mentor_teacher: 'teacher',
  school_principal: 'school_admin',
};

/** نقش staff فرانت → رشتهٔ `role` در `/v1/admin/admins`؛ ثبت‌نام عمومی `toNestRoleName` است. */
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

/** Nest → `UserRole` برای `/auth/me`؛ نقش جدید را اینجا و در `@/types/auth` با هم اضافه کن وگرنه silent به `assistant_admin`. */
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

/** نقش ناشناخته را throw نکن — login همه را خراب می‌کند؛ fallback `assistant_admin`. */
export function fromNestRoleName(name: string): UserRole {
  const mapped = NEST_NAME_TO_FE_ROLE[name as NestRoleName];
  if (!mapped) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[nest-auth-role] نقش ناشناخته از Nest: «${name}». به NEST_NAME_TO_FE_ROLE اضافه کنید.`
      );
    }
    // fail-open با کم‌دسترس‌ترین نقش ادمین تا جریان auth نشکند
    return 'assistant_admin';
  }
  return mapped;
}
