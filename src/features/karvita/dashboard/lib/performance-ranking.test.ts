import { describe, expect, it } from 'vitest';

import type { ReportRow } from '@/types/reports';

import { pickRankingItems, sortOrderFor } from './performance-ranking';

function row(id: string, score: number | undefined, extra: Partial<ReportRow> = {}): ReportRow {
  return { id, s: '', name: `n-${id}`, score, ...extra };
}

describe('pickRankingItems', () => {
  const rows = [
    row('a', 14),
    row('b', undefined),
    row('c', 9),
    row('d', 17.5),
    row('e', 12),
    row('f', 3),
    row('g', 19),
  ];

  it('treats rows without a score as 0 and ranks weakest first', () => {
    const items = pickRankingItems('province', rows, 'weak', 3);
    expect(items.map((i) => i.id)).toEqual(['b', 'f', 'c']);
    expect(items.map((i) => i.rank)).toEqual([1, 2, 3]);
    expect(items[0]?.score).toBe(0);
    expect(items[0]?.attendance).toBe(0);
    expect(items[0]?.response).toBe(0);
  });

  it('ranks strongest first', () => {
    const items = pickRankingItems('province', rows, 'strong', 2);
    expect(items.map((i) => i.id)).toEqual(['g', 'd']);
  });

  it('limits to six provinces by default', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      s: '',
      name: 'p' + i,
      score: i + 1,
    }));
    expect(pickRankingItems('province', many, 'weak')).toHaveLength(6);
  });

  it('limits to six faculties by default', () => {
    const many = Array.from({ length: 8 }, (_, i) => row('x' + i, i));
    expect(pickRankingItems('faculty', many, 'weak')).toHaveLength(6);
  });

  it('limits to six professors by default', () => {
    const many = Array.from({ length: 8 }, (_, i) => row('p' + i, i));
    expect(pickRankingItems('professor', many, 'strong')).toHaveLength(6);
  });

  it('builds subtitle per entity', () => {
    const [province] = pickRankingItems(
      'province',
      [row('p', 10, { head: 'دکتر الف' })],
      'weak'
    );
    expect(province?.subtitle).toBe('دکتر الف');
    const [faculty] = pickRankingItems(
      'faculty',
      [row('f', 10, { provName: 'فارس', cityName: 'شیراز' })],
      'weak'
    );
    expect(faculty?.subtitle).toBe('فارس · شیراز');
    const [professor] = pickRankingItems(
      'professor',
      [row('pr', 10, { code: '123', facName: 'فنی' })],
      'weak'
    );
    expect(professor?.subtitle).toBe('123 · فنی');
  });
});

describe('sortOrderFor', () => {
  it('maps direction to API sort order', () => {
    expect(sortOrderFor('weak')).toBe('asc');
    expect(sortOrderFor('strong')).toBe('desc');
  });
});
