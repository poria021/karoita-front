import { apiClient } from '@/services/api-client';
import type { NestFileResponseDto, NestFileUploadDto } from '@/types/nest-users';

/** Swagger: POST `/api/v1/files/upload` */
export const NEST_FILES_PATH = 'v1/files/upload';

/** آپلود مستقیم روی signed URL — از timeout کوتاه Nest جداست. */
const SIGNED_UPLOAD_TIMEOUT_MS = 60_000;

export const filesApi = {
  /**
   * مرحله ۱ — از سرور یک presigned S3 URL بگیر.
   * POST /api/v1/files/upload → { file: { id, path }, uploadSignedUrl }
   */
  upload(body: NestFileUploadDto, token?: string) {
    return apiClient.postJson<NestFileResponseDto>(NEST_FILES_PATH, body, token);
  },

  /**
   * مرحله ۲ — فایل رو مستقیم روی signed URL آپلود کن (بدون auth header).
   * S3/MinIO این درخواست رو بررسی می‌کنه نه Nest، پس token لازم نیست.
   */
  async uploadToSignedUrl(signedUrl: string, file: File): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      SIGNED_UPLOAD_TIMEOUT_MS
    );
    try {
      const res = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(
          `آپلود فایل ناموفق بود (HTTP ${res.status}). لطفاً دوباره تلاش کنید.`
        );
      }
    } catch (error) {
      const aborted =
        (typeof DOMException !== 'undefined' &&
          error instanceof DOMException &&
          error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError');
      if (aborted) {
        throw new Error(
          'آپلود فایل بیش از حد طول کشید. اتصال را بررسی کنید و دوباره تلاش کنید.'
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
