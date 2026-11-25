import { apiClient, ApiClientError } from '@/services/api-client';
import { bearerHeaders, resolveBearerToken } from '@/services/api-token';
import {
  EXPORT_ACCEPT,
  saveExportResponse,
} from '@/services/reports/real/save-export-response';
import { requireNestTransport } from '@/services/require-nest-transport';

import { NEST_STUDENT_ENROLLMENT_PATHS } from './student-enrollments.api';

/**
 * GET `/api/v1/student-enrollments/{id}/report-card` — کارنامهٔ دانشجو / مهارت‌آموز به‌صورت PDF.
 * بدنه به‌صورت بایت خوانده و با `saveExportResponse` ذخیره می‌شود؛ JSON/HTML خطا هرگز با پسوند pdf ذخیره نمی‌شود.
 */
export async function downloadRealReportCard(
  enrollmentId: string,
  fileName = 'report-card.pdf'
): Promise<void> {
  requireNestTransport('InternshipEnrollmentService.downloadReportCard');
  const bearer = await resolveBearerToken();
  const response = await fetch(
    `${apiClient.baseUrl}/${NEST_STUDENT_ENROLLMENT_PATHS.reportCard(
      encodeURIComponent(enrollmentId)
    )}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        ...bearerHeaders(bearer),
        'x-custom-lang': 'fa',
        Accept: EXPORT_ACCEPT.pdf,
      },
    }
  );

  if (!response.ok) {
    let message = 'دریافت کارنامه ناموفق بود.';
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === 'string' && body.message.trim()) {
        message = body.message;
      }
    } catch {
      // بدنهٔ غیر JSON؛ پیام پیش‌فرض.
    }
    throw new ApiClientError(message, response.status);
  }

  await saveExportResponse(response, fileName, 'pdf');
}
