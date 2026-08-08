import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentRecordStatus,
  InternshipEnrollmentRole,
  InternshipEnrollmentScenario,
} from '@/types/internship-enrollment';

export function kindForRole(
  role: InternshipEnrollmentRole
): InternshipCourseKind {
  return role === 'skill_learner' ? 'apprenticeship' : 'internship';
}

export function courseNameForKind(kind: InternshipCourseKind): string {
  return kind === 'apprenticeship' ? 'کارآموزی' : 'کارورزی';
}

export function maxLevelForKind(kind: InternshipCourseKind): 2 | 4 {
  return kind === 'apprenticeship' ? 2 : 4;
}

export function clampLevel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): InternshipEnrollmentLevel {
  const max = maxLevelForKind(kind);
  if (level < 1) return 1;
  if (level > max) return max as InternshipEnrollmentLevel;
  return level;
}

export function resolveEnrollmentScenario(input: {
  syllabusConfigured: boolean;
  enrollOpen: boolean;
  termOpen: boolean;
  registered: boolean;
  status?: InternshipEnrollmentRecordStatus;
  removalPending?: boolean;
  termArchived?: boolean;
}): InternshipEnrollmentScenario {
  if (
    input.registered &&
    (input.termOpen ||
      input.status === 'dropped' ||
      input.status === 'completed' ||
      input.removalPending ||
      input.termArchived)
  ) {
    return 'S5_term_active';
  }
  if (input.registered) return 'S4_registered_waiting';
  if (!input.syllabusConfigured) return 'S1_syllabus_blocked';
  // انتخاب واحد و برگزاری ترم مستقل‌اند؛ termOpen فقط مسیر بعد از ثبت‌نام را عوض می‌کند.
  if (input.enrollOpen) return 'S3_enroll_open';
  return 'S2_enroll_closed';
}
