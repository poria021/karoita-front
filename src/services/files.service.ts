import { requireNestTransport } from '@/services/require-nest-transport';
import { filesApi } from '@/services/files/files.api';
import { fileUploadUserMessage } from '@/services/files/parse-nest-file-upload';
import type {
  NestFileResponseDto,
  NestFileType,
  NestFileUploadDto,
} from '@/types/nest-users';

export { fileUploadUserMessage } from '@/services/files/parse-nest-file-upload';

/**
 * Facade فایل Nest: POST `/v1/files/upload` → PUT signed URL → PATCH `/v1/files/{id}/confirm`.
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
   * آپلود کامل: presign با mimeType، PUT روی S3، confirm، برگرداندن `{ id, path }`.
   * اسم فایل اصلی را به Nest بده؛ mimeType از بایت‌های در حال آپلود است (ممکن است compress باشد).
   */
  async uploadFile(
    file: File,
    token?: string,
    originalFile?: File
  ): Promise<NestFileType> {
    requireNestTransport('FilesService.uploadFile');

    try {
      const sourceFile = originalFile ?? file;
      const safeName = nestUploadFileName(sourceFile.name);
      const mimeType = nestUploadMimeType(file, sourceFile.name);

      const { file: fileRef, uploadSignedUrl } = await filesApi.upload(
        { fileName: safeName, fileSize: file.size, mimeType },
        token
      );

      await filesApi.uploadToSignedUrl(uploadSignedUrl, file, mimeType);
      const confirmed = await filesApi.confirm(fileRef.id, token);
      const confirmedPath =
        confirmed && typeof confirmed.path === 'string' ? confirmed.path.trim() : '';
      const objectUrl = absoluteObjectUrlFromSignedUrl(uploadSignedUrl);
      const path =
        (confirmedPath && /^(https?:)/i.test(confirmedPath)
          ? confirmedPath
          : null) ||
        objectUrl ||
        confirmedPath ||
        fileRef.path;

      return {
        ...fileRef,
        ...(confirmed ?? {}),
        id: confirmed?.id || fileRef.id,
        path,
      };
    } catch (error) {
      throw new Error(fileUploadUserMessage(error));
    }
  },
};

/** Nest فقط extension اسم را برای presign می‌سنجد؛ فایل compress ممکن است بدون پسوند باشد. */
export function nestUploadFileName(sourceName: string): string {
  return sourceName.includes('.') ? sourceName : `${sourceName}.jpg`;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

/**
 * `File.type` گاهی خالی است؛ Nest `mimeType` را string اجباری می‌خواهد.
 * نوع را از بایت‌های در حال آپلود بگیر، نه فقط از اسم فایل اصلی.
 */
export function nestUploadMimeType(file: File, originalName?: string): string {
  const fromBrowser = file.type.trim();
  if (fromBrowser) return fromBrowser;

  const name = originalName || file.name;
  const ext = name.includes('.')
    ? name.slice(name.lastIndexOf('.') + 1).toLowerCase()
    : '';
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}

export function absoluteObjectUrlFromSignedUrl(signedUrl: string): string | null {
  try {
    const url = new URL(signedUrl);
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
