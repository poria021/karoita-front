import { ApiClientError } from '@/services/api-error';
import type { NestFileResponseDto, NestFileType } from '@/types/nest-users';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapEnvelope(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new ApiClientError('پاسخ آپلود فایل از سرور نامعتبر است.');
  }
  if (isRecord(raw.data)) return raw.data;
  if (isRecord(raw.result)) return raw.result;
  return raw;
}

function readId(row: Record<string, unknown>): string {
  if (typeof row.id === 'string' && row.id.trim()) return row.id.trim();
  if (typeof row._id === 'string' && row._id.trim()) return row._id.trim();
  return '';
}

function readSignedUrl(doc: Record<string, unknown>): string {
  const keys = [
    'uploadSignedUrl',
    'signedUrl',
    'uploadUrl',
    'url',
  ] as const;
  for (const key of keys) {
    const value = doc[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function parseFile(raw: unknown): NestFileType {
  if (!isRecord(raw)) {
    throw new ApiClientError('شناسهٔ فایل در پاسخ آپلود نیامد.');
  }
  const id = readId(raw);
  if (!id) {
    throw new ApiClientError('شناسهٔ فایل در پاسخ آپلود نیامد.');
  }
  const path =
    (typeof raw.path === 'string' && raw.path.trim()) ||
    (typeof raw.key === 'string' && raw.key.trim()) ||
    id;
  return { id, path };
}

/**
 * بدنۀ ۲۰۱ `POST /api/v1/files/upload`:
 * `{ file: { id, path, ... }, uploadSignedUrl }`.
 * پاکت `data` / `result` و `_id` mongoose را هم می‌خواند.
 */
export function parseNestFileUploadResponse(raw: unknown): NestFileResponseDto {
  const doc = unwrapEnvelope(raw);
  const signedUrl = readSignedUrl(doc);
  if (!signedUrl) {
    throw new ApiClientError(
      'آدرس امضاشدهٔ آپلود از سرور نیامد. لطفاً دوباره تلاش کنید.'
    );
  }
  try {
    new URL(signedUrl);
  } catch {
    throw new ApiClientError('آدرس امضاشدهٔ آپلود نامعتبر است.');
  }
  return {
    file: parseFile(doc.file),
    uploadSignedUrl: signedUrl,
  };
}

export function fileUploadUserMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.message.trim()) {
    return error.message;
  }
  if (error instanceof Error && /failed to fetch/i.test(error.message)) {
    return 'آپلود فایل به فضای ذخیره‌سازی نرسید. اتصال را بررسی کنید و دوباره تلاش کنید.';
  }
  if (error instanceof TypeError) {
    return 'آپلود فایل به فضای ذخیره‌سازی نرسید. اتصال را بررسی کنید و دوباره تلاش کنید.';
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'ذخیره اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.';
}
