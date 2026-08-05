/**
 * انتخاب واحد کارورزی / کارآموزی — Phase 1 gate shell types.
 * Nest DTOs may expand later; keep English digits in data contracts.
 */

export type InternshipCourseKind = 'internship' | 'apprenticeship';

/** سطح درس — ASCII؛ نمایش با `toPersianDigits`. */
export type InternshipEnrollmentLevel = 1 | 2 | 3 | 4;

/**
 * سناریوهای Phase 1 (از original-karvita.html):
 * - S1: سرفصل فعال نشده + ثبت‌نام نشده
 * - S2: ارائه شده + مهلت ثبت‌نام بسته + ثبت‌نام نشده
 * - S4: ثبت‌نام شده + ترم هنوز باز نشده
 */
export type InternshipEnrollmentScenario =
  | 'S1_syllabus_blocked'
  | 'S2_enroll_closed'
  | 'S4_registered_waiting';

export type InternshipEnrollmentRole = 'student' | 'skill_learner';

/** خلاصهٔ ثبت‌نام برای کارت جزئیات S4 — فیلدهای تأخیری Phase 2 هنوز placeholder. */
export type InternshipEnrollmentSummary = {
  supervisorName: string | null;
  /** نمایش: «مشخص نشده» تا تعیین روز حضور در Phase 2 */
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
  /** نام دوره: کارورزی | کارآموزی */
  courseName: string;
  termTitle: string;
  /** تعداد سلول‌های پیش‌نمایش هفته برای S2 */
  weekPreviewCount: number;
  enrollment: InternshipEnrollmentSummary | null;
};

export type GetEnrollmentPageStateInput = {
  role: InternshipEnrollmentRole;
  level: InternshipEnrollmentLevel;
};
