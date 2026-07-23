import { describe, expect, it } from 'vitest';

import {
  mapOffsetLimitListError,
  mergeOffsetLimitPageItems,
  offsetLimitListQueryKey,
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
});
