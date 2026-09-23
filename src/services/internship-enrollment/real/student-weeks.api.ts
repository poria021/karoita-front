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
} as const;

export const studentWeeksApi = {
  /** PATCH /api/v1/student-weeks/{id}/score — نمرهٔ استاد راهنما؛ پاسخ بدون بدنه. */
  score(weekId: string, score: number): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_STUDENT_WEEKS_PATHS.score(weekId),
      { score }
    );
  },
};
