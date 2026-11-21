import { describe, expect, it } from 'vitest';

import type { ReportRow } from '@/types/reports';

import { summarizeFacultyResponseRate } from './faculty-response-rate';

function row(id: string, resp: number | undefined): ReportRow {
  return { id, s: '', name: id, resp };
}

describe('summarizeFacultyResponseRate', () => {
  it('میانگین و سطل‌های خوب/متوسط/ضعیف را می‌سازد', () => {
    const summary = summarizeFacultyResponseRate([
      row('a', 90),
      row('b', 70),
      row('c', 55),
      row('d', 40),
      row('e', 10),
      row('f', undefined),
    ]);
    expect(summary).toEqual({
      average: 44.2,
      high: 2,
      mid: 2,
      low: 2,
      total: 6,
      truncated: false,
    });
  });

  it('لیست خالی میانگین صفر برمی‌گرداند', () => {
    expect(summarizeFacultyResponseRate([], true)).toEqual({
      average: 0,
      high: 0,
      mid: 0,
      low: 0,
      total: 0,
      truncated: true,
    });
  });
});
