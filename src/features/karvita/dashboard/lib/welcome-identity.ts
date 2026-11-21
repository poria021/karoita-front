import type { User, UserRole } from '@/types/auth';
import { getRoleStrategy } from '@/utils/role-strategy';

/**
 * واحد سازمانی مرتبط با نقش — برای زیرنام خوش‌آمد
 * (مثلاً دانشکده برای استاد، مدرسه برای مدیر مدرسه).
 */
export function orgUnitForWelcome(user: Pick<
  User,
  'role' | 'college' | 'school' | 'district' | 'province' | 'city'
>): string | null {
  const first = (values: string[] | undefined): string | null => {
    const value = values?.find((item) => item.trim().length > 0)?.trim();
    return value || null;
  };

  switch (user.role) {
    case 'supervisor_professor':
    case 'faculty_role':
      return first(user.college);
    case 'mentor_teacher':
    case 'school_principal':
      return first(user.school) ?? first(user.district);
    case 'regional_edu_admin':
      return first(user.district) ?? first(user.city);
    case 'provincial_university':
      return first(user.province);
    default:
      return first(user.college) ?? first(user.school) ?? first(user.province);
  }
}

/** «استاد راهنما · دانشکده فنی» — اگر واحد نباشد فقط نقش. */
export function welcomeRoleOrgLine(
  role: UserRole,
  user: Pick<User, 'college' | 'school' | 'district' | 'province' | 'city'>
): string {
  const roleLabel = getRoleStrategy(role).label;
  const org = orgUnitForWelcome({ ...user, role });
  return org ? `${roleLabel} · ${org}` : roleLabel;
}
