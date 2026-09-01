import { requireNestTransport } from '@/services/require-nest-transport';
import { filesApi } from '@/services/files/files.api';
import type {
  NestFileResponseDto,
  NestFileType,
  NestFileUploadDto,
} from '@/types/nest-users';

/**
 * Facade فایل Nest — آپلود دومرحله‌ای: POST `/v1/files/upload` بعد PUT روی `uploadSignedUrl`.
 */
export const FilesService = {
  /** فقط presigned URL؛ فایل را آپلود نمی‌کند. */
  async requestUpload(
    body: NestFileUploadDto,
    token?: string
  ): Promise<NestFileResponseDto> {
    requireNestTransport('FilesService.requestUpload');
    return filesApi.upload(body, token);
  },

  /**
   * آپلود کامل: presign، PUT روی S3، برگرداندن `{ id, path }` برای PATCH `/users/{id}`.
   * اسم فایل اصلی (jpg/png) را به Nest بده — فقط extension برای presign است؛ محتوا ممکن است compress باشد.
   */
  async uploadFile(
    file: File,
    token?: string,
    originalFile?: File
  ): Promise<NestFileType> {
    requireNestTransport('FilesService.uploadFile');

    const sourceFile = originalFile ?? file;
    const safeName = nestUploadFileName(sourceFile.name);

    const { file: fileRef, uploadSignedUrl } = await filesApi.upload(
      { fileName: safeName, fileSize: file.size },
      token
    );

    await filesApi.uploadToSignedUrl(uploadSignedUrl, file);

    // path برگشتی معمولاً کلید S3 است؛ origin همان signed PUT را برای پیش‌نمایش مطلق نگه می‌داریم.
    return {
      ...fileRef,
      path: absoluteObjectUrlFromSignedUrl(uploadSignedUrl) ?? fileRef.path,
    };
  },
};

/** Nest فقط extension اسم را برای presign می‌سنجد؛ فایل compress ممکن است بدون پسوند باشد. */
export function nestUploadFileName(sourceName: string): string {
  return sourceName.includes('.') ? sourceName : `${sourceName}.jpg`;
}

export function absoluteObjectUrlFromSignedUrl(signedUrl: string): string | null {
  try {
    const url = new URL(signedUrl);
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
