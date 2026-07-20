import { describe, expect, it } from 'vitest';

import { computeDashboardListIsCold } from '@/lib/dashboard-list-cold';

describe('computeDashboardListIsCold', () => {
  it('is cold only before first ready on a true module miss', () => {
    expect(
      computeDashboardListIsCold({
        isLoading: true,
        itemCount: 0,
        hasError: false,
        cacheHit: false,
        hasEverReady: false,
      })
    ).toBe(true);
  });

  it('is not cold after hasEverReady even when tab/search empties rows', () => {
    expect(
      computeDashboardListIsCold({
        isLoading: true,
        itemCount: 0,
        hasError: false,
        cacheHit: false,
        hasEverReady: true,
      })
    ).toBe(false);
  });

  it('is not cold on cache hit (SPA revisit)', () => {
    expect(
      computeDashboardListIsCold({
        isLoading: true,
        itemCount: 0,
        hasError: false,
        cacheHit: true,
        hasEverReady: false,
      })
    ).toBe(false);
  });

  it('is not cold while soft-refreshing existing rows', () => {
    expect(
      computeDashboardListIsCold({
        isLoading: true,
        itemCount: 5,
        hasError: false,
        cacheHit: false,
        hasEverReady: true,
      })
    ).toBe(false);
  });

  it('is not cold when errored', () => {
    expect(
      computeDashboardListIsCold({
        isLoading: false,
        itemCount: 0,
        hasError: true,
        cacheHit: false,
        hasEverReady: false,
      })
    ).toBe(false);
  });
});
