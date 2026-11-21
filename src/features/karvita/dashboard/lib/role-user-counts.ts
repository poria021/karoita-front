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
  'central_organization',
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
  central_organization: faIcons.userGear,
};

export type RoleUserCountsMap = Partial<Record<UserRole, number>>;

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
