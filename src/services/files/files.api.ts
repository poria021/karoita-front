import { apiClient } from '@/services/api-client';
import type { NestFileResponseDto, NestFileUploadDto } from '@/types/nest-users';

/** Swagger: POST `/api/v1/files/upload` */
export const NEST_FILES_PATH = 'v1/files/upload';
/** Swagger: GET `/api/v1/files/:id` — presigned read URL */
export const NEST_FILE_READ_PATH = 'v1/files';

export const filesApi = {
  /**
   * مرحله ۱ — از سرور یک presigned S3 URL بگیر.
   * POST /api/v1/files/upload → { file: { id, path }, uploadSignedUrl }
   */
  upload(body: NestFileUploadDto, token?: string) {
    return apiClient.postJson<NestFileResponseDto>(NEST_FILES_PATH, body, token);
  },

  /**
   * GET /api/v1/files/:id — presigned read URL برای نمایش preview تصویر آپلودشده.
   * Nest یک { url: string } برمی‌گردونه که مستقیم می‌تونه در <img src> استفاده بشه.
   */
  async getReadUrl(fileId: string, token?: string): Promise<string> {
    const res = await apiClient.getJson<{ url: string } | { downloadUrl: string }>(
      `${NEST_FILE_READ_PATH}/${fileId}`,
      token
    );
    // بک‌اند ممکنه url یا downloadUrl برگردونه
    if ('url' in res && typeof res.url === 'string') return res.url;
    if ('downloadUrl' in res && typeof res.downloadUrl === 'string') return res.downloadUrl;
    throw new Error('پاسخ سرور فاقد URL تصویر است.');
  },

  /**
   * مرحله ۲ — فایل رو مستقیم روی signed URL آپلود کن (بدون auth header).
   * S3/MinIO این درخواست رو بررسی می‌کنه نه Nest، پس token لازم نیست.
   */
  async uploadToSignedUrl(signedUrl: string, file: File): Promise<void> {
    const res = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
    if (!res.ok) {
      throw new Error(
        `آپلود فایل ناموفق بود (HTTP ${res.status}). لطفاً دوباره تلاش کنید.`
      );
    }
  },
};
