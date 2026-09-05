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
  NestEnrollmentProfessor,
  NestStudentEnrollment,
  NestUpdateStudentEnrollmentDto,
} from '@/types/nest-student-enrollments';
import type { InternshipSupervisor } from '@/types/internship-enrollment';

export const NEST_STUDENT_ENROLLMENT_PATHS = {
  list: 'v1/student-enrollments',
  byId: (id: string) => `v1/student-enrollments/${id}`,
  openCourseSelection: 'v1/student-enrollments/open-course-selection',
  professors: 'v1/student-enrollments/professors',
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
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
