import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentRole,
} from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';

export type InternshipLevelTab = {
  level: InternshipEnrollmentLevel;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
};

export const INTERNSHIP_ENROLLMENT_CHROME_ID = 'internship-enrollment';

export function levelsForRole(
  role: InternshipEnrollmentRole
): InternshipEnrollmentLevel[] {
  return role === 'skill_learner' ? [1, 2] : [1, 2, 3, 4];
}

export function courseKindForRole(
  role: InternshipEnrollmentRole
): InternshipCourseKind {
  return role === 'skill_learner' ? 'apprenticeship' : 'internship';
}

export function courseNameForRole(role: InternshipEnrollmentRole): string {
  return role === 'skill_learner' ? 'کارآموزی' : 'کارورزی';
}

export function buildLevelTabs(
  role: InternshipEnrollmentRole
): InternshipLevelTab[] {
  const courseName = courseNameForRole(role);
  const icon =
    role === 'skill_learner'
      ? faIcons.screwdriverWrench
      : faIcons.graduationCap;

  return levelsForRole(role).map((level) => ({
    level,
    label: `${courseName} ${level}`,
    shortLabel: `${courseName} ${level}`,
    icon,
  }));
}
