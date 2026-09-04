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
import type { NestEnrollmentProfessor } from '@/types/nest-student-enrollments';
import type { InternshipSupervisor } from '@/types/internship-enrollment';

export const NEST_STUDENT_ENROLLMENT_PATHS = {
  openCourseSelection: 'v1/student-enrollments/open-course-selection',
  professors: 'v1/student-enrollments/professors',
} as const;

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
};
