import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  listEducations,
  listSchools,
  listUniversities,
  fetchAllNestCities,
} = vi.hoisted(() => ({
  listEducations: vi.fn(),
  listSchools: vi.fn(),
  listUniversities: vi.fn(),
  fetchAllNestCities: vi.fn(),
}));

vi.mock('@/services/admin-catalog/admin-catalog.api', () => ({
  adminCatalogApi: {
    listEducations,
    listSchools,
    listUniversities,
  },
  fetchAllNestCities,
}));

import {
  assertRealOrgDeleteAllowed,
  flushRealDeleteBlockedCache,
  getRealDeleteBlockedSets,
} from '@/services/org-structure/real/real-org-delete-blocked';

describe('getRealDeleteBlockedSets', () => {
  beforeEach(() => {
    flushRealDeleteBlockedCache();
    listEducations.mockReset();
    listSchools.mockReset();
    listUniversities.mockReset();
    fetchAllNestCities.mockReset();

    fetchAllNestCities.mockResolvedValue([
      { id: 'c1', title: 'کرج', province_id: 'p1' },
    ]);
    listEducations.mockResolvedValue([]);
    listSchools.mockResolvedValue([]);
    listUniversities.mockResolvedValue([]);
  });

  afterEach(() => {
    flushRealDeleteBlockedCache();
  });

  it('blocks a province that still has cities on later catalog pages', async () => {
    const sets = await getRealDeleteBlockedSets();
    expect(sets.provinces.has('p1')).toBe(true);
    expect(sets.provinces.has('p-free')).toBe(false);
  });

  it('reuses the in-flight / cached index instead of refetching every row', async () => {
    await getRealDeleteBlockedSets();
    await getRealDeleteBlockedSets();
    expect(fetchAllNestCities).toHaveBeenCalledTimes(1);
    expect(listEducations).toHaveBeenCalledTimes(1);
  });

  it('force refresh sees a newly created city', async () => {
    await getRealDeleteBlockedSets();
    fetchAllNestCities.mockResolvedValue([
      { id: 'c1', title: 'کرج', province_id: 'p1' },
      { id: 'c2', title: 'قم', province_id: 'p2' },
    ]);
    const sets = await getRealDeleteBlockedSets({ force: true });
    expect(sets.provinces.has('p2')).toBe(true);
    expect(fetchAllNestCities).toHaveBeenCalledTimes(2);
  });

  it('assertRealOrgDeleteAllowed throws the same copy as mock for a linked province', async () => {
    await expect(assertRealOrgDeleteAllowed('province', 'p1')).rejects.toThrow(
      /قابل حذف نیست/
    );
  });

  it('assertRealOrgDeleteAllowed no-ops for leaf kinds', async () => {
    await expect(assertRealOrgDeleteAllowed('school', 's1')).resolves.toBeUndefined();
    expect(fetchAllNestCities).not.toHaveBeenCalled();
  });
});
