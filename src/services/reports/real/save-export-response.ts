import { ApiClientError } from '@/services/api-client';

export type ExportFormat = 'excel' | 'pdf';

/** `Accept` برای فایل؛ نه JSON — تا هیچ لایه‌ای محتوا را JSON نکند. */
export const EXPORT_ACCEPT: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  excel:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*;q=0.5',
};

const EXPORT_MIME: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/** PDF با `%PDF` شروع می‌شود؛ xlsx یک zip است (`PK`). */
function hasExpectedMagic(bytes: Uint8Array, format: ExportFormat): boolean {
  if (format === 'pdf') {
    return (
      bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    );
  }
  return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

/**
 * ذخیرهٔ پاسخ خروجی گزارش (PDF/اکسل) به‌صورت فایل.
 * بدنه به‌صورت بایت خوانده می‌شود (هرگز JSON.parse روی فایل نمی‌شود).
 * اگر بایت‌های اول با فرمت نمی‌خواند (JSON خطا، HTML، پاسخ خراب)،
 * فایل خراب با پسوند pdf/xlsx ذخیره نمی‌شود؛ خطای واضح + لاگ کنسول می‌دهد.
 */
export async function saveExportResponse(
  response: Response,
  fileName: string,
  format?: ExportFormat
): Promise<void> {
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
  const buffer = await response.arrayBuffer();

  if (format) {
    const head = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
    if (!hasExpectedMagic(head, format)) {
      let message =
        'سرور فایل معتبر برنگرداند (Content-Type: ' +
        (contentType || 'نامشخص') +
        ').';
      let preview = '';
      try {
        preview = new TextDecoder().decode(
          new Uint8Array(buffer, 0, Math.min(2000, buffer.byteLength))
        );
        const parsed = JSON.parse(preview) as { message?: unknown };
        if (typeof parsed.message === 'string' && parsed.message.trim()) {
          message = parsed.message;
        }
      } catch {
        // بدنه JSON پیام‌دار نبود؛ پیام پیش‌فرض.
      }
      console.error('[report-export] پاسخ فایل نیست', {
        status: response.status,
        contentType,
        preview,
      });
      throw new ApiClientError(message, response.status);
    }
  } else if (contentType.includes('json') || contentType.startsWith('text/')) {
    throw new ApiClientError(
      'سرور به‌جای فایل، پاسخ متنی/JSON برگرداند.',
      response.status
    );
  }

  // اگر Content-Type غلط/خالی بود ولی بایت‌ها درست‌اند، نوع را خودمان می‌گذاریم.
  const type =
    format && !contentType.includes(format === 'pdf' ? 'pdf' : 'sheet')
      ? EXPORT_MIME[format]
      : contentType;
  const blob = new Blob([buffer], type ? { type } : undefined);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // revoke فوری در بعضی مرورگرها دانلود را قطع می‌کند.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
