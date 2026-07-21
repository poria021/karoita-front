import { describe, expect, it } from 'vitest';

import { dashboardListCacheKey } from '@/store/useDashboardModuleCache';

import {
  ORG_STRUCTURE_CACHE_NAMESPACE,
  orgStructureListResetKey,
} from './orgStructureListKeys';

describe('orgStructureListResetKey', () => {
  it('scopes by tab and trimmed search', () => {
    expect(orgStructureListResetKey('provinces', '')).toBe('provinces::');
    expect(orgStructureListResetKey('cities', 'تهران')).toBe('cities::تهران');
  });

  it('composes dashboard list cache keys like the page hook', () => {
    const resetKey = orgStructureListResetKey('schools', 'q');
    expect(
      dashboardListCacheKey(ORG_STRUCTURE_CACHE_NAMESPACE, resetKey)
    ).toBe('org-structure::schools::q');
  });
});
