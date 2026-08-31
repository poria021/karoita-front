import { describe, expect, it } from 'vitest';

import {
  flattenOffsetLimitPages,
  mapOffsetLimitListError,
  mergeOffsetLimitPageItems,
  offsetLimitListQueryKey,
  replaceOffsetLimitListItems,
  resolveOffsetLimitReportedTotal,
} from './offsetLimitInfiniteList.helpers';

describe('offsetLimitInfiniteList helpers', () => {
  it('builds stable TanStack query keys', () => {
    expect(offsetLimitListQueryKey('org', 'provinces::', 20)).toEqual([
      'offset-limit-list',
      'org',
      'provinces::',
      20,
    ]);
    expect(offsetLimitListQueryKey(undefined, 'x', 10)[1]).toBe('default');
  });

  it('merges pages and maps errors for list / loadMore', () => {
    expect(
      mergeOffsetLimitPageItems([{ id: 'a' }], {
        items: [{ id: 'b' }],
        total: 2,
        hasMore: false,
      })
    ).toEqual([{ id: 'a' }, { id: 'b' }]);

    expect(mapOffsetLimitListError(new Error('قطع'), 'fallback')).toBe('قطع');
    expect(mapOffsetLimitListError(null, 'بارگذاری فهرست ناموفق بود.')).toBe(
      'بارگذاری فهرست ناموفق بود.'
    );
  });

  it('flattens and replaces list pages for optimistic patches', () => {
    const data = {
      pages: [
        { items: [{ id: 'a' }], total: 2, hasMore: true },
        { items: [{ id: 'b' }], total: 2, hasMore: false },
      ],
      pageParams: [0, 1],
    };
    expect(flattenOffsetLimitPages(data)).toEqual([{ id: 'a' }, { id: 'b' }]);
    expect(
      replaceOffsetLimitListItems(data, [{ id: 'a' }], 1)
    ).toEqual({
      pages: [{ items: [{ id: 'a' }], total: 1, hasMore: false }],
      pageParams: [0],
    });
  });

  it('uses the largest reported total, not only the last page', () => {
    expect(
      resolveOffsetLimitReportedTotal([
        { items: [{ id: 'a' }], total: 25, hasMore: true },
        { items: [], total: 0, hasMore: false },
      ])
    ).toBe(25);
    expect(
      resolveOffsetLimitReportedTotal([
        { items: [{ id: 'a' }], total: 21, hasMore: true },
        { items: [{ id: 'b' }], total: 41, hasMore: true },
      ])
    ).toBe(41);
    expect(resolveOffsetLimitReportedTotal(undefined)).toBe(0);
  });
});
