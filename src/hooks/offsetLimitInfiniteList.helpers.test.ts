import { describe, expect, it } from 'vitest';

import {
  canLoadMoreOffsetLimitList,
  initialOffsetLimitListState,
  mapOffsetLimitListError,
  mergeOffsetLimitPageItems,
  offsetLimitListStateFromCache,
  toOffsetLimitListCachePayload,
} from './offsetLimitInfiniteList.helpers';

describe('offsetLimitInfiniteList helpers', () => {
  it('hydrates from cache without loading flags', () => {
    const state = offsetLimitListStateFromCache({
      items: [{ id: '1' }],
      total: 1,
      hasMore: false,
    });
    expect(state).toEqual({
      items: [{ id: '1' }],
      total: 1,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      loadMoreError: null,
    });
  });

  it('starts cold with isLoading true', () => {
    expect(initialOffsetLimitListState().isLoading).toBe(true);
    expect(initialOffsetLimitListState().items).toEqual([]);
  });

  it('gates loadMore on in-flight / loading / hasMore', () => {
    expect(
      canLoadMoreOffsetLimitList({
        inFlight: false,
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
      })
    ).toBe(true);
    expect(
      canLoadMoreOffsetLimitList({
        inFlight: true,
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
      })
    ).toBe(false);
    expect(
      canLoadMoreOffsetLimitList({
        inFlight: false,
        isLoading: true,
        isLoadingMore: false,
        hasMore: true,
      })
    ).toBe(false);
    expect(
      canLoadMoreOffsetLimitList({
        inFlight: false,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
      })
    ).toBe(false);
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

  it('writes cache payloads without busy flags', () => {
    expect(
      toOffsetLimitListCachePayload({
        items: [1],
        total: 1,
        hasMore: false,
      })
    ).toEqual({ items: [1], total: 1, hasMore: false });
  });
});
