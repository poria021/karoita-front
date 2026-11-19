import { describe, expect, it } from 'vitest';

import type { ReportRow } from '@/types/reports';

import { buildTeacherResponseRanking } from './teacher-response-ranking';

function row(id: string, name: string, resp: number | undefined, n?: number): ReportRow {
  return { id, name, resp, n } as unknown as ReportRow;
}

describe('buildTeacherResponseRanking', () => {
  const rows = [
    row('1', 'علی', 80, 10),
    row('2', 'سارا', 20, 4),
    row('3', 'پریا', undefined),
    row('4', 'امیر', 95, 7),
    row('5', 'نگار', 20),
    row('6', 'رضا', 55),
    row('7', 'مینا', 70),
  ];

  it('ضعیف‌ترین‌ها از کم به زیاد؛ معلمِ بدون نرخ با ۰ حساب می‌شود', () => {
    const { weakest } = buildTeacherResponseRanking(rows);
    expect(weakest.map((item) => item.id)).toEqual(['3', '2', '5', '6', '7']);
    expect(weakest[0]).toMatchObject({ rank: 1, response: 0 });
  });

  it('هم‌نرخ‌ها به ترتیب نام فارسی می‌آیند', () => {
    const { weakest } = buildTeacherResponseRanking(rows);
    // نگار و سارا هر دو ۲۰؛ «سارا» در ترتیب فارسی بعد از «نگار» نمی‌آید.
    const tied = weakest.filter((item) => item.response === 20).map((i) => i.name);
    expect(tied).toEqual([...tied].sort((a, b) => a.localeCompare(b, 'fa')));
  });

  it('قوی‌ترین‌ها از زیاد به کم و حداکثر ۵ تا', () => {
    const { strongest } = buildTeacherResponseRanking(rows);
    expect(strongest.map((item) => item.id)).toEqual(['4', '1', '7', '6', '2'].slice(0, 5));
    expect(strongest).toHaveLength(5);
    expect(strongest[0]).toMatchObject({ rank: 1, response: 95, learnerCount: 7 });
  });

  it('بدون معلم → دو فهرست خالی', () => {
    expect(buildTeacherResponseRanking([])).toEqual({ weakest: [], strongest: [] });
  });
});
