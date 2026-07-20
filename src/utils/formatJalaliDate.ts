const JALALI_DATE_FORMATTER = new Intl.DateTimeFormat('fa-IR', {
  calendar: 'persian',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function getTodayJalaliFormatted(date: Date = new Date()): string {
  return JALALI_DATE_FORMATTER.format(date);
}
