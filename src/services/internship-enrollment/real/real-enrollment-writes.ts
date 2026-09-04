import { throwRealModeNotImplemented } from '@/lib/api-mode';

/**
 * نوشتن ثبت‌نام کارورزی / گزارش هفتگی — endpoint Nest در فرانت نیست.
 * خواندن open-course-selection و professors در `real-enrollment-reads` است.
 */
export function assertEnrollmentWriteReady(surface: string): never {
  throwRealModeNotImplemented(surface);
}
