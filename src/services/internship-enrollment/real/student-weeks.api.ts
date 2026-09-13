/**
 * HTTP گزارش هفتگی دانشجو. مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) است.
 * Swagger: PATCH start/submit بدنه ندارند؛ POST submissions `CreateContentDto` می‌گیرد.
 */
import { apiClient } from '@/services/api-client';
import type { NestStudentWeekSubmission } from '@/types/nest-student-enrollments';

export const NEST_STUDENT_WEEKS_PATHS = {
  start: (id: string) => `v1/student-weeks/${id}/start`,
  submit: (id: string) => `v1/student-weeks/${id}/submit`,
  submissions: (id: string) => `v1/student-weeks/${id}/submissions`,
} as const;

export type NestCreateContentDto = {
  text?: string;
  fileIds?: string[];
};

export const studentWeeksApi = {
  /** PATCH /api/v1/student-weeks/{id}/start — هفته را باز می‌کند؛ پاسخ بدون بدنه. */
  start(weekId: string): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.start(weekId),
      {}
    );
  },

  /** PATCH /api/v1/student-weeks/{id}/submit — هفته را نهایی می‌کند؛ پاسخ بدون بدنه. */
  submit(weekId: string): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.submit(weekId),
      {}
    );
  },

  /** POST /api/v1/student-weeks/{id}/submissions — متن و شناسه‌های فایل؛ ۲۰۱ بدون بدنه. */
  addSubmission(weekId: string, body: NestCreateContentDto): Promise<unknown> {
    return apiClient.postMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.submissions(weekId),
      body
    );
  },

  /** GET /api/v1/student-weeks/{id}/submissions — تاریخچهٔ ارسال‌های این هفته. */
  async listSubmissions(weekId: string): Promise<NestStudentWeekSubmission[]> {
    const raw = await apiClient.getJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.submissions(weekId)
    );
    return Array.isArray(raw) ? (raw as NestStudentWeekSubmission[]) : [];
  },
};
