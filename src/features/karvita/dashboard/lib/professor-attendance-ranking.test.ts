import { describe, expect, it } from 'vitest';

import type { ReportRow } from '@/types/reports';

import { buildProfessorAttendanceRanking } from './professor-attendance-ranking';

function row(id: string, att: number | undefined): ReportRow {
  return { id, s: '', name: `n-${id}`, att };
}

describe('buildProfessorAttendanceRanking', () => {
  const rows = [
    row('a', 90),
    row('b', undefined),
    row('c', 40),
    row('d', 75),
    row('e', 10),
    row('f', 55),
    row('g', 100),
  ];

  it('ضعیف‌ترین‌ها را بر اساس حضور کم مرتب می‌کند', () => {
    const { weakest } = buildProfessorAttendanceRanking(rows);
    expect(weakest.map((i) => i.id)).toEqual(['b', 'e', 'c', 'f', 'd', 'a']);
    expect(weakest[0]?.attendance).toBe(0);
  });

  it('قوی‌ترین‌ها را بر اساس حضور زیاد مرتب می‌کند', () => {
    const { strongest } = buildProfessorAttendanceRanking(rows, 3);
    expect(strongest.map((i) => i.id)).toEqual(['g', 'a', 'd']);
  });
});
