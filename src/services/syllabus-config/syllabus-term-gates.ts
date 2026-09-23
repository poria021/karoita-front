import { persianToEnglishDigits } from '@/utils/persianDigits';

/** وزن پیش‌فرض هر هفته در جدول سرفصل — مشترک mock و real. */
export const DEFAULT_WEEK_WEIGHT = 3;

/** امروز جلالی با ارقام انگلیسی `YYYY/MM/DD` برای state/API */
export function getTodayJalaliSlash(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'persian',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}/${month}/${day}`;
}

export function isJalaliSlashOnOrBefore(
  candidate: string,
  reference: string
): boolean {
  const left = persianToEnglishDigits(candidate.trim());
  const right = persianToEnglishDigits(reference.trim());
  if (!left || !right) return false;
  return left <= right;
}

export function isTermGateActive(
  isOpen: boolean,
  startDate: string,
  today: string = getTodayJalaliSlash()
): boolean {
  return isOpen && isJalaliSlashOnOrBefore(startDate, today);
}
