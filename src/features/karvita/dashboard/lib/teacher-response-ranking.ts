import type { ReportRow } from '@/types/reports';

/** تعداد ردیف هر تب (ضعیف‌ترین / قوی‌ترین) در باکس معلمان مدرسه. */
export const TEACHER_RESPONSE_RANKING_LIMIT = 6;

export type TeacherResponseRankingItem = {
  id: string;
  rank: number;
  name: string;
  /** تعداد فراگیران معلم؛ undefined اگر API نداده باشد. */
  learnerCount?: number;
  /** نرخ پاسخ‌دهی (۰ تا ۱۰۰) — معیار رتبه‌بندی. */
  response: number;
};

export type TeacherResponseRankingSummary = {
  weakest: TeacherResponseRankingItem[];
  strongest: TeacherResponseRankingItem[];
};

/** مقدار عددی یا صفر؛ مثل جدول گزارش، معلمِ بدون داده «۰» حساب می‌شود. */
function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function pick(
  rows: readonly ReportRow[],
  direction: 'weak' | 'strong',
  limit: number
): TeacherResponseRankingItem[] {
  const sorted = [...rows].sort((a, b) => {
    const diff = numberOrZero(a.resp) - numberOrZero(b.resp);
    if (diff !== 0) return direction === 'weak' ? diff : -diff;
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'fa');
  });
  return sorted.slice(0, limit).map((row, index) => ({
    id: row.id,
    rank: index + 1,
    name: row.name?.trim() || '—',
    learnerCount: typeof row.n === 'number' ? row.n : undefined,
    response: numberOrZero(row.resp),
  }));
}

/**
 * ضعیف‌ترین و قوی‌ترین معلمان مدرسه بر اساس نرخ پاسخ‌دهی (`responseRate`).
 * ضعیف‌ترین‌ها از کم به زیاد، قوی‌ترین‌ها از زیاد به کم؛ هم‌نرخ → ترتیب نام فارسی.
 */
export function buildTeacherResponseRanking(
  rows: readonly ReportRow[],
  limit: number = TEACHER_RESPONSE_RANKING_LIMIT
): TeacherResponseRankingSummary {
  return {
    weakest: pick(rows, 'weak', limit),
    strongest: pick(rows, 'strong', limit),
  };
}
