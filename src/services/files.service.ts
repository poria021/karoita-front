import { requireNestTransport } from '@/services/require-nest-transport';
import { filesApi } from '@/services/files/files.api';
import type {
  NestFileResponseDto,
  NestFileType,
  NestFileUploadDto,
} from '@/types/nest-users';

/**
 * Nest Files facade — https://backenddev.darkube.ir/docs#/ Files
 *
 * جریان دومرحله‌ای آپلود:
 *  ۱. POST /api/v1/files/upload → { file: { id, path }, uploadSignedUrl }
 *  ۲. PUT  <uploadSignedUrl>   → فایل رو مستقیم روی S3/MinIO آپلود کن
 */
export const FilesService = {
  /**
   * درخواست presigned URL بدون آپلود واقعی فایل — در صورت نیاز به مرحله‌ها به‌صورت جداگانه استفاده کن.
   */
  async requestUpload(
    body: NestFileUploadDto,
    token?: string
  ): Promise<NestFileResponseDto> {
    requireNestTransport('FilesService.requestUpload');
    return filesApi.upload(body, token);
  },

  /**
   * آپلود کامل دومرحله‌ای:
   * ۱) presigned URL بگیر
   * ۲) فایل رو روی signed URL آپلود کن
   * ۳) رفرنس فایل { id, path } برگرداند — یک صدا کافیه
   *
   * @returns NestFileType — { id, path } که `id` رو باید در PATCH /users/{id} به photo بدی.
   */
  async uploadFile(file: File, token?: string): Promise<NestFileType> {
    requireNestTransport('FilesService.uploadFile');

    // مرحله ۱: از Nest presigned URL بگیر
    const { file: fileRef, uploadSignedUrl } = await filesApi.upload(
      { fileName: file.name, fileSize: file.size },
      token
    );

    // مرحله ۲: فایل رو مستقیم روی signed URL آپلود کن (بدون Authorization header)
    await filesApi.uploadToSignedUrl(uploadSignedUrl, file);

    // مرحله ۳: رفرنس فایل برگردان — یک صدا کافیه برای لینک کردن به پروفایل
    return fileRef;
  },
};
