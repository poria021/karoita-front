import type { ReportRow } from '@/types/reports';

/** آستانهٔ «خوب» — نرخ پاسخ‌دهی (۰ تا ۱۰۰). */
export const FACULTY_RESPONSE_HIGH = 70;
/** آستانهٔ «متوسط» — زیر این «ضعیف» است. */
export const FACULTY_RESPONSE_MID = 40;

export type FacultyResponseRateSummary = {
  /** میانگین نرخ پاسخ‌دهی اساتید (۰ تا ۱۰۰). */
  average: number;
  high: number;
  mid: number;
  low: number;
  total: number;
  truncated: boolean;
};

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * توزیع اساتید بر اساس نرخ پاسخ‌دهی (`responseRate`) برای دونات میز کار دانشکده.
 */
export function summarizeFacultyResponseRate(
  rows: readonly ReportRow[],
  truncated = false
): FacultyResponseRateSummary {
  let sum = 0;
  let high = 0;
  let mid = 0;
  let low = 0;
  for (const row of rows) {
    const resp = numberOrZero(row.resp);
    sum += resp;
    if (resp >= FACULTY_RESPONSE_HIGH) high += 1;
    else if (resp >= FACULTY_RESPONSE_MID) mid += 1;
    else low += 1;
  }
  const total = rows.length;
  return {
    average: total === 0 ? 0 : Math.round((sum / total) * 10) / 10,
    high,
    mid,
    low,
    total,
    truncated,
  };
}
