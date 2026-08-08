/** Shared weekly-report attachment limits (UI dropzone + mock Facade). */

export const WEEKLY_REPORT_MAX_FILE_SIZE_MB = 5;
export const WEEKLY_REPORT_MAX_TOTAL_SIZE_MB = 100;

export const WEEKLY_REPORT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-zip': ['.zip'],
} as const;

export const WEEKLY_REPORT_ACCEPT_LABEL =
  'فرمت‌های مجاز: PDF، TXT و ZIP تا سقف ۵ مگابایت';

export const WEEKLY_REPORT_INVALID_TYPE_MESSAGE =
  'فرمت فایل انتخابی مجاز نیست. فقط PDF، TXT یا ZIP مجاز است.';

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.zip']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
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
