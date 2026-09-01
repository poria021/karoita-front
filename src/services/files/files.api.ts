import { apiClient } from '@/services/api-client';
import type { NestFileResponseDto, NestFileUploadDto } from '@/types/nest-users';

/** POST `/api/v1/files/upload`. */
export const NEST_FILES_PATH = 'v1/files/upload';

/** آپلود مستقیم روی signed URL — از timeout کوتاه Nest جداست. */
const SIGNED_UPLOAD_TIMEOUT_MS = 60_000;

export const filesApi = {
  /** مرحله ۱ — POST /api/v1/files/upload → `{ file, uploadSignedUrl }`. */
  upload(body: NestFileUploadDto, token?: string) {
    return apiClient.postJson<NestFileResponseDto>(NEST_FILES_PATH, body, token);
  },

  /**
   * مرحله ۲ — PUT مستقیم روی signed URL بدون auth؛ S3/MinIO این را می‌سنجد نه Nest.
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
