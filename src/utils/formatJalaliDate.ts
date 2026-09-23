import { toPersianDigits } from '@/utils/persianDigits';

const JALALI_DATE_FORMATTER = new Intl.DateTimeFormat('fa-IR', {
  calendar: 'persian',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;

/**
 * تاریخ جلالی برای نمایش هدر: «چهارشنبه ۳۱ تیر ۱۴۰۵»
 * (ترتیب Intl پیش‌فرض fa-IR برعکس و برای RTL درهم می‌شود.)
 */
export function formatJalaliDate(date: Date = new Date()): string {
  const parts = JALALI_DATE_FORMATTER.formatToParts(date);
  const valueOf = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';

  const weekday = valueOf('weekday');
  const day = valueOf('day');
  const month = valueOf('month');
  const year = valueOf('year');

  return `${weekday} ${day} ${month} ${year}`.trim();
}

export function getTodayJalaliFormatted(date: Date = new Date()): string {
  return formatJalaliDate(date);
}

/** جلالی کوتاه برای نمایش: `۱۴۰۴/۴/۳۱` (بدون صفر پیشوند). */
export function formatJalaliSlashDisplay(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'persian',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return toPersianDigits(`${year}/${month}/${day}`);
}

/**
 * جلالی همراه ساعت برای نمایش دقیق یک رویداد (نه نسبی): `۱۴۰۴/۴/۳۱ - ۱۴:۰۵`.
 * ورودی نامعتبر/خالی → رشتهٔ خالی (فراخوان تصمیم می‌گیرد که اصلاً نمایش ندهد).
 */
export function formatJalaliDateTimeDisplay(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const dateParts = new Intl.DateTimeFormat('en-US', {
    calendar: 'persian',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const year = dateParts.find((part) => part.type === 'year')?.value ?? '';
  const month = dateParts.find((part) => part.type === 'month')?.value ?? '';
  const day = dateParts.find((part) => part.type === 'day')?.value ?? '';

  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return toPersianDigits(`${year}/${month}/${day} - ${time}`);
}

/**
 * زمان اعلان: تا یک هفته نسبی («۵ دقیقه قبل»)، بعد از آن تاریخ جلالی اسلش.
 */
export function formatNotificationTime(
  createdAt: Date | string,
  now: Date = new Date()
): string {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Math.max(0, now.getTime() - date.getTime());

  if (diffMs < ONE_MINUTE_MS) {
    return 'چند لحظه قبل';
  }
  if (diffMs < ONE_HOUR_MS) {
    const minutes = Math.floor(diffMs / ONE_MINUTE_MS);
    return `${toPersianDigits(String(minutes))} دقیقه قبل`;
  }
  if (diffMs < ONE_DAY_MS) {
    const hours = Math.floor(diffMs / ONE_HOUR_MS);
    return `${toPersianDigits(String(hours))} ساعت قبل`;
  }
  if (diffMs < ONE_WEEK_MS) {
    const days = Math.floor(diffMs / ONE_DAY_MS);
    return `${toPersianDigits(String(days))} روز قبل`;
  }

  return formatJalaliSlashDisplay(date);
}
