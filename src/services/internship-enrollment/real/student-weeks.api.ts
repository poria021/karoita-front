/**
 * HTTP نمرهٔ هفتگی دانشجو. مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) است.
 * `start`/`submit`/`submissions` قبلاً هم اینجا بودند اما طبق OpenAPI زندهٔ
 * بک‌اند دیگر وجود ندارند (۴۰۴ «Cannot PATCH/GET ...» — نه خطای کسب‌وکار، خطای
 * نبودِ route)؛ گزارش/بازخورد هفتگی حالا همه از `POST/GET /conversations/{id}/messages`
 * می‌گذرد (ببین `real-enrollment-weekly.ts`, `real-daily-approvals-mutations.ts`,
 * `mappers/week-feedback.ts`). فقط `score` باقی مانده چون در همان لیست هست.
 */
import { apiClient } from '@/services/api-client';

export const NEST_STUDENT_WEEKS_PATHS = {
  score: (id: string) => `v1/student-weeks/${id}/score`,
  mentorPresent: (id: string) => `v1/student-weeks/${id}/mentor-present`,
  approveMentorPresent: (id: string) =>
    `v1/student-weeks/${id}/approve-mentor-present`,
  approveStudentPresent: (id: string) =>
    `v1/student-weeks/${id}/approve-student-present`,
  canWatchOthers: (id: string) => `v1/student-weeks/${id}/can-watch-others`,
} as const;

export const studentWeeksApi = {
  /** PATCH /api/v1/student-weeks/{id}/score — نمرهٔ استاد راهنما؛ پاسخ بدون بدنه. */
  score(
    weekId: string,
    score: number,
    schoolVisited = false
  ): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.score(weekId),
      { score, schoolVisited }
    );
  },

  /** PATCH /api/v1/student-weeks/{id}/mentor-present — اعلام حضور استاد راهنما در مدرسه (فقط mentor)؛ پاسخ بدون بدنه. */
  setMentorPresent(
    weekId: string,
    isMentorPresent: boolean
  ): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.mentorPresent(weekId),
      { isMentorPresent }
    );
  },

  /**
   * PATCH /api/v1/student-weeks/{id}/approve-mentor-present — تأیید حضور استاد
   * راهنما در مدرسه (فقط school_admin)؛ `mentorPresentAt` اختیاری (ISO).
   */
  approveMentorPresent(
    weekId: string,
    approved: boolean,
    mentorPresentAt?: string
  ): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.approveMentorPresent(weekId),
      {
        isApprovedBySchoolAdminMentorPresent: approved,
        ...(mentorPresentAt ? { mentorPresentAt } : {}),
      }
    );
  },

  /**
   * PATCH /api/v1/student-weeks/{id}/approve-student-present — تأیید حضور
   * کارورز در مدرسه (فقط school_admin)؛ `studentPresentAt` اختیاری (ISO).
   */
  approveStudentPresent(
    weekId: string,
    approved: boolean,
    studentPresentAt?: string
  ): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.approveStudentPresent(weekId),
      {
        isApprovedBySchoolAdminStudentPresent: approved,
        ...(studentPresentAt ? { studentPresentAt } : {}),
      }
    );
  },

  /** PATCH /api/v1/student-weeks/{id}/can-watch-others — فقط mentor؛ پاسخ بدون بدنه. */
  setCanWatchOthers(weekId: string, canWatchOthers: boolean): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.canWatchOthers(weekId),
      { canWatchOthers }
    );
  },
};
