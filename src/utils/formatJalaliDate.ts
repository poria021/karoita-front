/**
 * "Simulated" Farsi (Jalali) date, mirroring `getTodayJalaliFormatted()` from
 * `original-karvita.html`. Uses the browser's native `Intl` Persian calendar
 * instead of a third-party date library (rule 00, #1: no extra dependencies
 * for something the platform already provides).
 *
 * Client-only by nature: the formatted string depends on the visitor's local
 * clock, so only call this from inside components mounted after
 * `HydrationSafe` to avoid an SSR/CSR text mismatch.
 */
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
