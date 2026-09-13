/**
 * HTTP انتخاب واحد دانشجو. مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) است —
 * دوباره `api/` نگذار.
 */
import { apiClient } from '@/services/api-client';
import { ApiClientError } from '@/services/api-error';
import { toSearchParams } from '@/services/nest-search-params';
import {
  mapEnrollmentProfessor,
  parseOpenCourseSelection,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';
import { parseNestPagedList } from '@/types/nest-admin';
import type { NestSemesterWithLessons } from '@/types/nest-admin';
import type {
  NestCreateStudentEnrollmentDto,
  NestEnrollmentProfessor,
  NestMentorCapacity,
  NestMentorStudent,
  NestMentorStudentsPage,
  NestScoreSummary,
  NestStudentEnrollment,
  NestStudentWeek,
  NestUpdateStudentEnrollmentDto,
} from '@/types/nest-student-enrollments';
import type { InternshipSupervisor } from '@/types/internship-enrollment';

export const NEST_STUDENT_ENROLLMENT_PATHS = {
  list: 'v1/student-enrollments',
  byId: (id: string) => `v1/student-enrollments/${id}`,
  cancel: (id: string) => `v1/student-enrollments/${id}/cancel`,
  weeks: (id: string) => `v1/student-enrollments/${id}/weeks`,
  scoreSummary: (id: string) => `v1/student-enrollments/${id}/score-summary`,
  openCourseSelection: 'v1/student-enrollments/open-course-selection',
  professors: 'v1/student-enrollments/professors',
  teachers: 'v1/student-enrollments/teachers',
  mentorStudents: 'v1/student-enrollments/mentor/students',
  mentorCapacity: 'v1/student-enrollments/mentor/capacity',
} as const;

export type ListMyEnrollmentsQuery = {
  page?: number;
  limit?: number;
};

export const ENROLLMENT_PROFESSORS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

export type ListEnrollmentProfessorsQuery = {
  semesterId: string;
  lessonId: string;
  page?: number;
  limit?: number;
};

export type EnrollmentProfessorsPage = {
  data: InternshipSupervisor[];
  hasNextPage: boolean;
};

function isAbsentOpenSemester(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.status === 404 || error.status === 204)
  );
}

export const studentEnrollmentsApi = {
  /**
   * POST `/api/v1/student-enrollments` — ثبت‌نام اولیه با استاد راهنما.
   * Swagger مستند ۲۰۴ (بی‌بدنه) دارد؛ اگر بدنه برگرداند همان را برمی‌گردانیم،
   * وگرنه GET لیست می‌زنیم تا ردیف جدید را پیدا کنیم.
   */
  async create(
    body: NestCreateStudentEnrollmentDto
  ): Promise<NestStudentEnrollment | null> {
    const raw = await apiClient.postMaybeJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.list,
      body
    );
    if (isRecord(raw)) return raw as NestStudentEnrollment;
    // ۲۰۴ — ردیف جدید را از لیست کاربر جاری پیدا می‌کنیم.
    try {
      const rows = await studentEnrollmentsApi.listMine();
      return (
        rows.find(
          (row) =>
            (row.semesterId ?? '').trim() === body.semesterId.trim() &&
            (row.lessonId ?? '').trim() === body.lessonId.trim()
        ) ?? null
      );
    } catch {
      return null;
    }
  },

  /**
   * GET `/api/v1/student-enrollments/open-course-selection`.
   * ترم باز نباشد → `null` (۴۰۴/۲۰۴ یا بدنهٔ بدون id).
   */
  async getOpenCourseSelection(): Promise<NestSemesterWithLessons | null> {
    try {
      const raw = await apiClient.getJson<unknown>(
        NEST_STUDENT_ENROLLMENT_PATHS.openCourseSelection
      );
      return parseOpenCourseSelection(raw);
    } catch (error) {
      if (isAbsentOpenSemester(error)) return null;
      throw error;
    }
  },

  /**
   * GET `/api/v1/student-enrollments/professors?semesterId=&lessonId=`.
   */
  async listProfessors(
    query: ListEnrollmentProfessorsQuery
  ): Promise<EnrollmentProfessorsPage> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.professors,
      undefined,
      {
        searchParams: toSearchParams({
          semesterId: query.semesterId,
          lessonId: query.lessonId,
          page: query.page,
          limit: query.limit ?? ENROLLMENT_PROFESSORS_PAGE_SIZE,
        }),
      }
    );
    const parsed = parseNestPagedList<NestEnrollmentProfessor>(raw);
    return {
      data: parsed.data
        .map(mapEnrollmentProfessor)
        .filter((item): item is InternshipSupervisor => item !== null),
      hasNextPage: parsed.hasNextPage,
    };
  },

  /**
   * GET `/api/v1/student-enrollments/teachers?schoolId=` — معلمان ناظر یک مدرسه.
   * پاسخ در Swagger بدون schema است؛ هم آرایهٔ خام و هم پاکت `{data, hasNextPage}`
   * را با `parseNestPagedList` می‌پذیریم تا هر شکلی که لایو داد نشکند.
   */
  async listTeachers(schoolId: string): Promise<unknown[]> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.teachers,
      undefined,
      { searchParams: toSearchParams({ schoolId }) }
    );
    return parseNestPagedList<unknown>(raw).data;
  },

  /**
   * GET `/api/v1/student-enrollments` — لیست ثبت‌نام‌های کاربر جاری.
   * Swagger نمونه‌اش آرایهٔ خام است (نه پاکت `{data, hasNextPage}`)؛
   * `parseNestPagedList` هر دو شکل را می‌پذیرد تا اگر لایو پاکت داد نشکند.
   */
  async listMine(
    query: ListMyEnrollmentsQuery = {}
  ): Promise<NestStudentEnrollment[]> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.list,
      undefined,
      { searchParams: toSearchParams({ page: query.page, limit: query.limit }) }
    );
    return parseNestPagedList<NestStudentEnrollment>(raw).data;
  },

  /** GET `/api/v1/student-enrollments/{id}/weeks` — تایم‌لاین هفته‌های این ثبت‌نام. */
  async listWeeks(id: string): Promise<NestStudentWeek[]> {
    const raw = await apiClient.getJson<unknown>(NEST_STUDENT_ENROLLMENT_PATHS.weeks(id));
    return Array.isArray(raw) ? (raw as NestStudentWeek[]) : [];
  },

  /** GET `/api/v1/student-enrollments/{id}/score-summary`. */
  async getScoreSummary(id: string): Promise<NestScoreSummary | null> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.scoreSummary(id)
    );
    return isRecord(raw) ? (raw as NestScoreSummary) : null;
  },

  /** GET `/api/v1/student-enrollments/{id}`. ۴۰۴ → `null`. */
  async getById(id: string): Promise<NestStudentEnrollment | null> {
    try {
      const raw = await apiClient.getJson<unknown>(
        NEST_STUDENT_ENROLLMENT_PATHS.byId(id)
      );
      return isRecord(raw) ? (raw as NestStudentEnrollment) : null;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) return null;
      throw error;
    }
  },

  /**
   * PATCH `/api/v1/student-enrollments/{id}` — فقط مدرسه/معلم راهنما.
   * پاسخ ۲۰۰ رکورد کامل ثبت‌نام را برمی‌گرداند.
   */
  async updateSchoolTeacher(
    id: string,
    body: NestUpdateStudentEnrollmentDto
  ): Promise<NestStudentEnrollment | null> {
    const raw = await apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.byId(id),
      body
    );
    return isRecord(raw) ? (raw as NestStudentEnrollment) : null;
  },

  /** PATCH `/api/v1/student-enrollments/{id}/cancel` — لغو ثبت‌نام. */
  async cancel(id: string): Promise<NestStudentEnrollment | null> {
    const raw = await apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.cancel(id),
      {}
    );
    return isRecord(raw) ? (raw as NestStudentEnrollment) : null;
  },

  /**
   * GET `/api/v1/student-enrollments/mentor/students`
   * فهرست دانشجویان/مهارت‌آموزان متصل به منتور احراز هویت‌شده.
   */
  async listMentorStudents(query: {
    page?: number;
    limit?: number;
    semesterId?: string;
    lessonId?: string;
  } = {}): Promise<NestMentorStudentsPage> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.mentorStudents,
      undefined,
      {
        searchParams: toSearchParams({
          page: query.page,
          limit: query.limit,
          semesterId: query.semesterId,
          lessonId: query.lessonId,
        }),
      }
    );
    const parsed = parseNestPagedList<NestMentorStudent>(raw);
    return { data: parsed.data, hasNextPage: parsed.hasNextPage };
  },

  /**
   * GET `/api/v1/student-enrollments/mentor/capacity?semesterId=`
   * خلاصهٔ ظرفیت منتور در یک ترم (کل، انتخاب‌شده، باقی‌مانده).
   */
  async getMentorCapacity(semesterId: string): Promise<NestMentorCapacity> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_ENROLLMENT_PATHS.mentorCapacity,
      undefined,
      { searchParams: toSearchParams({ semesterId }) }
    );
    return (isRecord(raw) ? raw : {}) as NestMentorCapacity;
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
