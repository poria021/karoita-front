import type { User } from '@/types/auth';

/**
 * انتخاب واحد کارورزی / کارآموزی — قراردادهای mock Phase 2.
 * Nest DTOs may expand later; keep English digits in data contracts.
 */

export type InternshipCourseKind = 'internship' | 'apprenticeship';

/** سطح درس — ASCII در مسیر/داده؛ نمایش با `toPersianDigits`. */
export type InternshipEnrollmentLevel = 1 | 2 | 3 | 4;

/**
 * سناریوهای Phase 1 (امپتی‌استیت؛ بدون جدول گزارش هفتگی):
 * - S1: سرفصل فعال نشده + ثبت‌نام نشده
 * - S2: مهلت ثبت‌نام بسته / ترم در جریان بدون ثبت‌نام
 * - S3: مهلت ثبت‌نام باز + هنوز ثبت‌نام نشده
 * - S4: ثبت‌نام شده + ترم هنوز شروع نشده
 */
export type InternshipEnrollmentScenario =
  | 'S1_syllabus_blocked'
  | 'S2_enroll_closed'
  | 'S3_enroll_open'
  | 'S4_registered_waiting';

export type InternshipEnrollmentRole = 'student' | 'skill_learner';

export type InternshipEnrollmentActor = Pick<
  User,
  | 'id'
  | 'approved'
  | 'province'
  | 'college'
  | 'district'
  | 'specialPermissions'
> & {
  role: InternshipEnrollmentRole;
};

export type InternshipCapacity = number | null;

export type InternshipSupervisor = {
  id: string;
  name: string;
  college: string;
  province: string;
  day: string;
  capacity: InternshipCapacity;
  readOnly?: boolean;
};

export type InternshipSchoolCapacity = {
  id: string;
  name: string;
  province: string;
  district: string;
  capacities: Partial<Record<InternshipEnrollmentLevel, InternshipCapacity>>;
};

export type InternshipMentorCapacity = {
  id: string;
  name: string;
  schoolId: string;
  capacities: Partial<Record<InternshipEnrollmentLevel, InternshipCapacity>>;
};

export type InternshipEnrollmentRecord = {
  id: string;
  userId: string;
  role: InternshipEnrollmentRole;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  termTitle: string;
  title: string;
  supervisorId: string | null;
  supervisorName: string | null;
  schoolName: string | null;
  mentorName: string | null;
  wasDropped?: boolean;
  droppedSupervisorName?: string;
};

export type InternshipSelectionScope = {
  province: string;
  college: string;
  provinces: string[];
  colleges: string[];
  collegesByProvince: Record<string, string[]>;
  canChangeScope: boolean;
};

export type InternshipEnrollmentSummary = {
  supervisorName: string | null;
  attendanceDaysLabel: string;
  schoolName: string | null;
  mentorName: string | null;
  courseTitle: string;
  termTitle: string;
};

export type InternshipEnrollmentPageState = {
  scenario: InternshipEnrollmentScenario;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  courseName: string;
  termTitle: string;
  termId: string;
  enrollment: InternshipEnrollmentSummary | null;
  selection: {
    scope: InternshipSelectionScope;
    wasDropped: boolean;
    droppedSupervisorName: string | null;
  } | null;
};

export type GetEnrollmentPageStateInput = {
  actor: InternshipEnrollmentActor;
  level: InternshipEnrollmentLevel;
};

export type ListEligibleSupervisorsInput = {
  actor: InternshipEnrollmentActor;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  query: string;
  province: string;
  college: string;
};

export type EnrollWithSupervisorInput = {
  actor: InternshipEnrollmentActor;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  supervisorId: string;
};
