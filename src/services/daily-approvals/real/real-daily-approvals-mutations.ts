import { throwRealModeNotImplemented } from '@/lib/api-mode';

/**
 * mutationهای تأیید روزانه — در Nest هنوز به فرانت وصل نشده‌اند.
 * خواندن ترم/درس/هفته از capacities + syllabus است (در facade جدا).
 */
export function assertDailyApprovalsMutationReady(surface: string): never {
  throwRealModeNotImplemented(surface);
}
