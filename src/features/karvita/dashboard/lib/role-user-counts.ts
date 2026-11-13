import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/role-strategy';

export type RoleUserCountMetric = {
  id: UserRole;
  label: string;
  count: number;
  icon: IconDefinition;
};

/** نقش‌های نمایشی روی میز کار — بدون مدیر ارشد. */
export const ROLE_USER_COUNT_ORDER = [
  'student',
  'skill_learner',
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
  'regional_edu_admin',
  'faculty_role',
  'provincial_university',
  'assistant_admin',
] as const satisfies readonly UserRole[];

export type RoleUserCountId = (typeof ROLE_USER_COUNT_ORDER)[number];

const ROLE_ICONS: Record<RoleUserCountId, IconDefinition> = {
  student: faIcons.graduationCap,
  skill_learner: faIcons.briefcase,
  supervisor_professor: faIcons.chalkboardUser,
  mentor_teacher: faIcons.userTie,
  school_principal: faIcons.school,
  regional_edu_admin: faIcons.mapLocationDot,
  faculty_role: faIcons.university,
  provincial_university: faIcons.buildingColumns,
  assistant_admin: faIcons.userGear,
};

export type RoleUserCountsMap = Partial<Record<UserRole, number>>;

/**
 * دادهٔ موقت تا API بک‌اند وصل شود.
 * بعداً با پاسخ واقعی `loadRoleUserCounts` جایگزین می‌شود.
 */
export const FAKE_ROLE_USER_COUNTS: RoleUserCountsMap = {
  student: 1284,
  skill_learner: 416,
  supervisor_professor: 87,
  mentor_teacher: 142,
  school_principal: 63,
  regional_edu_admin: 28,
  faculty_role: 19,
  provincial_university: 11,
  assistant_admin: 4,
};

export function buildRoleUserCountMetrics(
  counts: RoleUserCountsMap | null | undefined
): RoleUserCountMetric[] {
  if (!counts) return [];
  return ROLE_USER_COUNT_ORDER.map((id) => ({
    id,
    label: getRoleStrategy(id).label,
    count: Math.max(0, counts[id] ?? 0),
    icon: ROLE_ICONS[id],
  }));
}

export function sumRoleUserCounts(
  metrics: readonly RoleUserCountMetric[]
): number {
  return metrics.reduce((sum, metric) => sum + metric.count, 0);
}

export function tallyRolesFromList(
  roles: readonly UserRole[]
): RoleUserCountsMap {
  const counts: RoleUserCountsMap = {};
  for (const role of roles) {
    counts[role] = (counts[role] ?? 0) + 1;
  }
  return counts;
}
