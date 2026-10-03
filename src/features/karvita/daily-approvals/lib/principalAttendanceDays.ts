/**
 * روزهای کاری (شنبه تا پنجشنبه) هفته‌ای که مدیر مدرسه حضور کارورز را در آن
 * تأیید می‌کند. Nest تاریخ شروع هفته را نمی‌دهد، پس هفتهٔ تقویمیِ زمان ارسال
 * گزارش (یا امروز اگر گزارشی ارسال نشده) مبنا قرار می‌گیرد.
 */
export type PrincipalAttendanceDay = {
  /** `YYYY-MM-DD` (میلادی، ASCII) — مقدار ذخیره‌شده. */
  isoDate: string;
  weekdayLabel: string;
  dateLabel: string;
};

const WORKDAY_COUNT = 6;

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPrincipalAttendanceDays(
  anchorIso: string | null | undefined
): PrincipalAttendanceDay[] {
  const anchor = anchorIso ? new Date(anchorIso) : new Date();
  const base = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
  // getDay: یکشنبه=0 … شنبه=6 → فاصله تا شنبهٔ قبل.
  const sinceSaturday = (base.getDay() + 1) % 7;
  const saturday = new Date(base.getFullYear(), base.getMonth(), base.getDate() - sinceSaturday);

  const weekdayFormat = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });
  const dateFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return Array.from({ length: WORKDAY_COUNT }, (_, offset) => {
    const day = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate() + offset);
    return {
      isoDate: toIsoDate(day),
      weekdayLabel: weekdayFormat.format(day),
      dateLabel: dateFormat.format(day),
    };
  });
}

/** متن خلاصهٔ حضور برای ضمیمه‌شدن به پیام بازخورد مدیر (بک‌اند فیلد جدا ندارد). */
export function formatPrincipalAttendanceSummary(isoDates: readonly string[]): string {
  if (isoDates.length === 0) return '';
  const weekdayFormat = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });
  const dateFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const parts = [...isoDates].sort().map((iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y!, m! - 1, d!);
    return `${weekdayFormat.format(date)} ${dateFormat.format(date)}`;
  });
  return `تأیید حضور کارورز در مدرسه: ${parts.join('، ')}`;
}
