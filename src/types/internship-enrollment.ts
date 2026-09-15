import type { User } from '@/types/auth';

/**
 * انتخاب واحد کارورزی / کارآموزی — قراردادهای mock Phase 2.
 * DTOهای Nest ممکن است بعداً گسترده شوند؛ ارقام در قرارداد داده انگلیسی بمانند.
 */

export type InternshipCourseKind = 'internship' | 'apprenticeship';

/** سطح درس — ASCII در مسیر/داده؛ نمایش با `toPersianDigits`. */
export type InternshipEnrollmentLevel = 1 | 2 | 3 | 4;

/**
 * سناریوهای Phase 1–2:
 * - S1: سرفصل فعال نشده + ثبت‌نام نشده
 * - S2: مهلت ثبت‌نام بسته / ترم در جریان بدون ثبت‌نام
 * - S3: مهلت ثبت‌نام باز + هنوز ثبت‌نام نشده
 * - S4: ثبت‌نام شده + ترم هنوز شروع نشده
 * - S5: ثبت‌نام شده + ترم فعال / گزارش‌نویسی
 * - S6: در درس دیگری از همین نیم‌سال انتخاب واحد شده (جلوگیری از بن‌بست اخذ مجدد)
 */
export type InternshipEnrollmentScenario =
  | 'S1_syllabus_blocked'
  | 'S2_enroll_closed'
  | 'S3_enroll_open'
  | 'S4_registered_waiting'
  | 'S5_term_active'
  | 'S6_already_enrolled_elsewhere';

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
  days: string[];
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

export type InternshipEnrollmentRecordStatus =
  | 'active'
  | 'dropped'
  | 'completed';

export type InternshipWeeklySessionState =
  | 'draft'
  | 'pending'
  | 'needs_edit'
  | 'approved'
  | 'graded'
  | 'archived'
  | 'locked_future'
  | 'overdue'
  | 'extended'
  | 'locked_dropped';

export type InternshipWeeklyReportFile = {
  id: string;
  name: string;
  /** مگابایت اعشاری انگلیسی در قرارداد داده؛ نمایش با `toPersianDigits`. */
  sizeMb: number;
  mimeType?: string;
};

/** سطح شایستگی ۱–۵ (ASCII) — نمایش فارسی فقط در UI. */
export type InternshipCompetencyRating = '1' | '2' | '3' | '4' | '5';

export type InternshipWeeklyReportFeedback = {
  advisor?: string;
  mentor?: string;
  principal?: string;
  mentorRating?: InternshipCompetencyRating;
  principalRating?: InternshipCompetencyRating;
};

export type InternshipWeeklySession = {
  id: string;
  title: string;
  status: InternshipWeeklySessionState;
  score: number | null;
  isExtended?: boolean;
  text?: string;
  files?: InternshipWeeklyReportFile[];
  feedback?: InternshipWeeklyReportFeedback;
};

export type SaveWeeklyReportDraftInput = {
  actor: InternshipEnrollmentActor;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  weekId: string;
  text: string;
  files: InternshipWeeklyReportFile[];
};

export type SubmitWeeklyReportInput = SaveWeeklyReportDraftInput;

export type InternshipProgressiveGrade = {
  gradedCount: number;
  final20: number | null;
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
  schoolId?: string | null;
  schoolName: string | null;
  mentorId?: string | null;
  mentorName: string | null;
  attendanceDaysLabel?: string;
  status?: InternshipEnrollmentRecordStatus;
  removalPending?: boolean;
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

/**
 * چرا `attendanceDaysLabel` خالی مانده — فقط وقتی معنا دارد که آن رشته خالی
 * باشد. `'capacity-exhausted'` یعنی استاد به‌خاطر پر شدن ظرفیتش از GET
 * `/professors` (تنها منبع این فیلد) خارج شده؛ `'error'` یعنی خودِ درخواست
 * fail شده. UI از این‌ها برای یک متن/تولتیپ روشن‌تر به‌جای سکوت استفاده می‌کند.
 */
export type AttendanceDaysUnavailableReason = 'capacity-exhausted' | 'error';

export type InternshipEnrollmentSummary = {
  supervisorName: string | null;
  attendanceDaysLabel: string;
  attendanceDaysUnavailableReason?: AttendanceDaysUnavailableReason | null;
  schoolId: string | null;
  schoolName: string | null;
  mentorId: string | null;
  mentorName: string | null;
  courseTitle: string;
  termTitle: string;
  status: InternshipEnrollmentRecordStatus;
  removalPending: boolean;
  isTermArchived: boolean;
  weeks: InternshipWeeklySession[];
  progressiveGrade: InternshipProgressiveGrade;
  /** false یعنی `weeks`/`progressiveGrade` از mock fallback آمده‌اند، نه GET واقعی. */
  weeksAreReal: boolean;
};

export type InternshipEnrollmentPageState = {
  scenario: InternshipEnrollmentScenario;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  courseName: string;
  termTitle: string;
  termId: string;
  /** شناسهٔ درس Nest برای GET professors؛ در mock همان catalog id است. */
  lessonId: string | null;
  enrollment: InternshipEnrollmentSummary | null;
  selection: {
    scope: InternshipSelectionScope;
    wasDropped: boolean;
    droppedSupervisorName: string | null;
  } | null;
  /** در S6 — درس فعال دیگری که کارآموز همین ترم دارد. */
  conflictEnrollment: {
    level: InternshipEnrollmentLevel;
    courseTitle: string;
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
  semesterId?: string;
  lessonId?: string;
};

export type EnrollWithSupervisorInput = {
  actor: InternshipEnrollmentActor;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  supervisorId: string;
};

export type ListDelayedSchoolsInput = {
  actor: InternshipEnrollmentActor;
  level: InternshipEnrollmentLevel;
  query: string;
};

export type ListDelayedMentorsInput = {
  actor: InternshipEnrollmentActor;
  level: InternshipEnrollmentLevel;
  schoolId: string;
  query: string;
};

export type AssignDelayedSchoolMentorInput = {
  actor: InternshipEnrollmentActor;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  schoolId: string;
  mentorId: string;
};

export type CancelEnrollmentInput = {
  actor: InternshipEnrollmentActor;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
};
