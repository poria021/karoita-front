/** سقف پیوست گزارش هفتگی (dropzone UI + Facade mock). */

export const WEEKLY_REPORT_MAX_FILE_SIZE_MB = 5;
export const WEEKLY_REPORT_MAX_TOTAL_SIZE_MB = 100;

export const WEEKLY_REPORT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-zip': ['.zip'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
} as const;

export const WEEKLY_REPORT_ACCEPT_LABEL =
  'فرمت‌های مجاز: PDF، TXT، ZIP و تصویر (PNG، JPG، WEBP) تا سقف ۵ مگابایت';

export const WEEKLY_REPORT_INVALID_TYPE_MESSAGE =
  'فرمت فایل انتخابی مجاز نیست. فقط PDF، TXT، ZIP یا تصویر (PNG، JPG، WEBP) مجاز است.';

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.txt',
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export function isAllowedWeeklyReportAttachment(file: {
  name: string;
  mimeType?: string;
}): boolean {
  const ext = file.name.includes('.')
    ? `.${file.name.split('.').pop()!.toLowerCase()}`
    : '';
  if (ALLOWED_EXTENSIONS.has(ext)) return true;
  if (file.mimeType && ALLOWED_MIME_TYPES.has(file.mimeType)) return true;
  return false;
}
