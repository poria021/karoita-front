import { describe, expect, it } from 'vitest';

import { FAKE_SCHOOL_RANKING } from './school-ranking-preview';
import { FAKE_TEACHER_RESPONSE_RANKING } from './teacher-response-ranking-preview';

const isSorted = (values: number[], dir: 'asc' | 'desc') =>
  values.every(
    (value, i) =>
      i === 0 || (dir === 'asc' ? value >= values[i - 1]! : value <= values[i - 1]!)
  );

describe('regional ranking fake previews', () => {
  it('مدارس: ۵ ضعیف (صعودی) و ۵ قوی (نزولی) و ضعیف‌ها پایین‌تر از قوی‌ها', () => {
    const { weakest, strongest } = FAKE_SCHOOL_RANKING;
    expect(weakest).toHaveLength(5);
    expect(strongest).toHaveLength(5);
    expect(isSorted(weakest.map((i) => i.score), 'asc')).toBe(true);
    expect(isSorted(strongest.map((i) => i.score), 'desc')).toBe(true);
    expect(Math.max(...weakest.map((i) => i.score))).toBeLessThan(
      Math.min(...strongest.map((i) => i.score))
    );
    expect(Math.max(...[...weakest, ...strongest].map((i) => i.score))).toBeLessThanOrEqual(20);
  });

  it('معلمان: ۵ ضعیف (صعودی) و ۵ قوی (نزولی)، نرخ بین ۰ تا ۱۰۰', () => {
    const { weakest, strongest } = FAKE_TEACHER_RESPONSE_RANKING;
    expect(weakest).toHaveLength(5);
    expect(strongest).toHaveLength(5);
    expect(isSorted(weakest.map((i) => i.response), 'asc')).toBe(true);
    expect(isSorted(strongest.map((i) => i.response), 'desc')).toBe(true);
    for (const item of [...weakest, ...strongest]) {
      expect(item.response).toBeGreaterThanOrEqual(0);
      expect(item.response).toBeLessThanOrEqual(100);
    }
  });

  it('شناسه‌ها یکتا هستند', () => {
    for (const summary of [FAKE_SCHOOL_RANKING, FAKE_TEACHER_RESPONSE_RANKING]) {
      const ids = [...summary.weakest, ...summary.strongest].map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
