import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_LIMIT,
  sliceOffsetLimitPage,
} from '@/utils/offset-limit-page';

describe('sliceOffsetLimitPage', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }));

  it('defaults to page size 20', () => {
    expect(DEFAULT_PAGE_LIMIT).toBe(20);
    const page = sliceOffsetLimitPage(rows, 0);
    expect(page.items).toHaveLength(20);
    expect(page.total).toBe(25);
    expect(page.hasMore).toBe(true);
  });

  it('computes hasMore from offset + page length', () => {
    const mid = sliceOffsetLimitPage(rows, 10, 10);
    expect(mid.items.map((r) => r.id)).toEqual([
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ]);
    expect(mid.hasMore).toBe(true);

    const last = sliceOffsetLimitPage(rows, 20, 10);
    expect(last.items).toHaveLength(5);
    expect(last.hasMore).toBe(false);
  });

  it('returns empty page past the end', () => {
    const page = sliceOffsetLimitPage(rows, 40, 10);
    expect(page.items).toEqual([]);
    expect(page.hasMore).toBe(false);
    expect(page.total).toBe(25);
  });
});
