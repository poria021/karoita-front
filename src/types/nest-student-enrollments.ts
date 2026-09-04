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
