import type { UserRole } from '@/types/auth';
import type { OrgMajorAudience } from '@/types/org-structure';

/**
 * FE role → English `title` on GET /admin/roles (degree catalog).
 * These ids are not the auth-role ids from GET /auth/roles.
 */
const FE_TO_DEGREE_ROLE_TITLE: Partial<Record<UserRole, string>> = {
  student: 'student',
  skill_learner: 'trainee',
  supervisor_professor: 'mentor',
  mentor_teacher: 'teacher',
};

export function toDegreeCatalogRoleTitle(role: UserRole): string | undefined {
  return FE_TO_DEGREE_ROLE_TITLE[role];
}

/** Mock majors still use the profile audience enum, not Nest titles. */
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
