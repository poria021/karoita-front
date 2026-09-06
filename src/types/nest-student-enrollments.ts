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
 * `schoolId`/`teacherId`/`completedAt` در Swagger `{}` هستند — یعنی ممکن است رشتهٔ
 * شناسه یا سند populated (با `id`/`title`) باشند؛ هر دو حالت باید پشتیبانی شود.
 */
export type NestStudentEnrollment = {
  id?: string;
  _id?: string;
  studentId?: string;
  semesterId?: string;
  lessonId?: string;
  schoolId?: string | { id?: string; _id?: string; title?: string; name?: string } | null;
  teacherId?: string | { id?: string; _id?: string; title?: string; name?: string } | null;
  professorId?: string;
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
