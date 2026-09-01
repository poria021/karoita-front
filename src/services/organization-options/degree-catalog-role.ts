import type { UserRole } from '@/types/auth';
import type { OrgMajorAudience } from '@/types/org-structure';

/** نقش فرانت → `title` انگلیسی GET /admin/roles؛ این idها همان GET /auth/roles نیستند. */
const FE_TO_DEGREE_ROLE_TITLE: Partial<Record<UserRole, string>> = {
  student: 'student',
  skill_learner: 'trainee',
  supervisor_professor: 'mentor',
  mentor_teacher: 'teacher',
};

export function toDegreeCatalogRoleTitle(role: UserRole): string | undefined {
  return FE_TO_DEGREE_ROLE_TITLE[role];
}

/** در mock رشته هنوز از enum مخاطب پروفایل است نه `title`های Nest. */
export function toMockMajorAudience(
  role: UserRole
): OrgMajorAudience | undefined {
  if (
    role === 'student' ||
    role === 'skill_learner' ||
    role === 'supervisor_professor'
  ) {
    return role;
  }
  return undefined;
}
