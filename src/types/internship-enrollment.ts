/**
 * انتخاب واحد کارورزی / کارآموزی — Phase 1 gate shell types.
 * Nest DTOs may expand later; keep English digits in data contracts.
 */

export type InternshipCourseKind = 'internship' | 'apprenticeship';

/** سطح درس فعال برای رکورد ثبت‌نام — ASCII؛ نمایش با `toPersianDigits`. */
export type InternshipEnrollmentLevel = 1 | 2 | 3 | 4;

/**
 * سناریوهای Phase 1 (امپتی‌استیت؛ بدون جدول گزارش هفتگی):
 * - S1: سرفصل فعال نشده + ثبت‌نام نشده
 * - S2: مهلت ثبت‌نام بسته / ترم در جریان بدون ثبت‌نام
 * - S3: مهلت ثبت‌نام باز + هنوز ثبت‌نام نشده (شروع انتخاب واحد)
 * - S4: ثبت‌نام شده + ترم هنوز شروع نشده
 */
export type InternshipEnrollmentScenario =
  | 'S1_syllabus_blocked'
  | 'S2_enroll_closed'
  | 'S3_enroll_open'
  | 'S4_registered_waiting';

export type InternshipEnrollmentRole = 'student' | 'skill_learner';

/** خلاصهٔ ثبت‌نام برای S4 — فیلدهای تأخیری Phase 2 هنوز placeholder. */
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
  /** سطح فعال دوره (بدون تب UI — فقط دادهٔ دامنه) */
  level: InternshipEnrollmentLevel;
  courseName: string;
  termTitle: string;
  enrollment: InternshipEnrollmentSummary | null;
};

export type GetEnrollmentPageStateInput = {
  role: InternshipEnrollmentRole;
};
