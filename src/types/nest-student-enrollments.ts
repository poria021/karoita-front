/**
 * DTOهای پورتال دانشجو/مهارت‌آموز — GET `/api/v1/student-enrollments/*`.
 * شکل استاد لایو ممکن است کاربر Nest یا ردیف ظرفیت populated باشد؛ mapper هر دو را می‌پذیرد.
 */
import type { NestLesson, NestSemesterWithLessons } from '@/types/nest-admin';

/** GET `/student-enrollments/open-course-selection` — ترم باز + درس‌ها. */
export type NestOpenCourseSelection = NestSemesterWithLessons & {
  lessons: NestLesson[];
};

/** ردیف GET `/student-enrollments/professors` — فیلدها اختیاری چون Swagger نمونهٔ پر ندارد. */
export type NestEnrollmentProfessor = {
  id?: string;
  _id?: string;
  professorId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fname?: string;
  lname?: string;
  days?: number[];
  day?: string;
  capacity?: number;
  remainingCapacity?: number;
  remaining?: number;
  university?: unknown;
  college?: unknown;
  campus?: unknown;
  province?: unknown;
  professor?: unknown;
};

export type NestEnrollmentStatus = 'active' | 'dropped' | 'completed' | 'cancelled';

/**
 * GET `/student-enrollments` (فهرست کاربر جاری) و GET `/student-enrollments/{id}`.
 *
 * طبق OpenAPI زندهٔ بک‌اند (`/docs-json` روی `backenddev.darkube.ir`، تأیید
 * ۱۴۰۵/۰۶/۲۳)، این دو اندپوینت دو شکل متفاوت دارند:
 * - لیست (`GET /student-enrollments`, schema `StudentEnrollmentListItemDto`):
 *   `schoolId`/`teacherId`/`professorId` همیشه رشتهٔ id خام‌اند، **و کنارشان**
 *   سه فیلد جدای populated `school`/`teacher`/`professor` هم می‌آید که اسم را
 *   دارد — این منبع اصلی نام‌هاست، نه یک query جدا.
 * - تک‌ردیف/PATCH (schema `StudentEnrollment`): فقط id خام دارد، فیلدهای
 *   populated بالا را ندارد.
 * mapperها (`resolveEnrollmentSchool`/`resolveEnrollmentMentor`/
 * `resolveEnrollmentProfessor` در `enrollment-summary.ts`) این تفاوت را با
 * اولویت به فیلد populated و fallback به id خام پوشش می‌دهند.
 */
export type NestStudentEnrollment = {
  id?: string;
  _id?: string;
  studentId?: string;
  semesterId?: string;
  lessonId?: string;
  schoolId?: string | { id?: string; _id?: string; title?: string; name?: string } | null;
  teacherId?: string | { id?: string; _id?: string; title?: string; name?: string } | null;
  /**
   * روی برخی پاسخ‌ها Nest این فیلد را populate می‌کند (سند استاد به‌جای رشتهٔ
   * id)؛ mapper هر دو حالت را می‌پذیرد — ببین `extractNestProfessor`.
   */
  professorId?:
    | string
    | { id?: string; _id?: string; firstName?: string; lastName?: string; name?: string }
    | null;
  /** فقط روی پاسخ لیست هست (`StudentEnrollmentListItemDto.school`). */
  school?: { id?: string; title?: string | null } | null;
  /** فقط روی پاسخ لیست هست (`StudentEnrollmentListItemDto.teacher`). */
  teacher?: { id?: string; firstName?: string | null; lastName?: string | null } | null;
  /** فقط روی پاسخ لیست هست (`StudentEnrollmentListItemDto.professor`). */
  professor?: { id?: string; firstName?: string | null; lastName?: string | null } | null;
  status?: NestEnrollmentStatus | string;
  startedAt?: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** بدنهٔ POST `/student-enrollments` — ثبت‌نام اولیهٔ دانشجو/کارآموز با استاد راهنما. */
export type NestCreateStudentEnrollmentDto = {
  semesterId: string;
  lessonId: string;
  professorId: string;
  schoolId?: string;
  teacherId?: string;
};

/** بدنهٔ PATCH `/student-enrollments/{id}` — فقط مدرسه/معلم قابل تغییرند. */
export type NestUpdateStudentEnrollmentDto = {
  schoolId?: string;
  teacherId?: string;
};

/** GET `/student-enrollments/mentor/students` — یک ردیف در لیست دانشجویان منتور. */
export type NestMentorStudent = NestStudentEnrollment & {
  student?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    photo?: unknown;
    roleName?: string;
  };
};

/** پاسخ صفحه‌بندی شدهٔ GET `/student-enrollments/mentor/students`. */
export type NestMentorStudentsPage = {
  data: NestMentorStudent[];
  hasNextPage: boolean;
};

/** GET `/student-enrollments/mentor/capacity` — ظرفیت منتور در یک ترم. */
export type NestMentorCapacity = {
  semesterId?: string;
  allTeacherCapacity?: number;
  selected?: number;
  remain?: number;
};

/**
 * ردیف GET `/student-enrollments/{id}/weeks`. Swagger enum کامل `status` را مستند
 * نکرده (نمونه‌های دیده‌شده: `pending`, `in_progress`)؛ mapper به‌جای اتکا به این
 * رشته، وضعیت UI را از `score`/`submittedAt`/`startedAt` استخراج می‌کند.
 */
export type NestStudentWeek = {
  id?: string;
  _id?: string;
  enrollmentId?: string;
  weekId?:
    | string
    | { id?: string; _id?: string; lessonId?: string; priority?: number; status?: boolean };
  status?: string;
  score?: number | null;
  scoreGivenBy?: string | null;
  scoreGivenAt?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  completedAt?: string | null;
};

/** GET `/student-enrollments/{id}/score-summary`. */
export type NestScoreSummary = {
  totalScore: number;
  scoredWeeks: number;
  totalWeeks: number;
  maximumScore: number;
};

/** ردیف GET/POST `/student-weeks/{id}/submissions`. */
export type NestStudentWeekSubmission = {
  id?: string;
  _id?: string;
  studentWeekId?: string;
  submittedById?: string;
  text?: string;
  fileIds?: string[];
  files?: unknown[];
  createdAt?: string;
  updatedAt?: string;
};
