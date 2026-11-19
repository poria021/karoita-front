import type { ReportRow } from '@/types/reports';

/** تعداد ردیف هر تب در باکس حضور اساتید دانشکده. */
export const PROFESSOR_ATTENDANCE_RANKING_LIMIT = 5;

export type ProfessorAttendanceRankingItem = {
  id: string;
  rank: number;
  name: string;
  /** درصد حضور (۰ تا ۱۰۰) — معیار رتبه‌بندی. */
  attendance: number;
};

export type ProfessorAttendanceRankingSummary = {
  weakest: ProfessorAttendanceRankingItem[];
  strongest: ProfessorAttendanceRankingItem[];
};

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function pick(
  rows: readonly ReportRow[],
  direction: 'weak' | 'strong',
  limit: number
): ProfessorAttendanceRankingItem[] {
  const sorted = [...rows].sort((a, b) => {
    const diff = numberOrZero(a.att) - numberOrZero(b.att);
    if (diff !== 0) return direction === 'weak' ? diff : -diff;
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'fa');
  });
  return sorted.slice(0, limit).map((row, index) => ({
    id: row.id,
    rank: index + 1,
    name: row.name?.trim() || '—',
    attendance: numberOrZero(row.att),
  }));
}

/**
 * ضعیف‌ترین و قوی‌ترین اساتید بر اساس درصد حضور (`attendancePercent`).
 */
export function buildProfessorAttendanceRanking(
  rows: readonly ReportRow[],
  limit: number = PROFESSOR_ATTENDANCE_RANKING_LIMIT
): ProfessorAttendanceRankingSummary {
  return {
    weakest: pick(rows, 'weak', limit),
    strongest: pick(rows, 'strong', limit),
  };
}
