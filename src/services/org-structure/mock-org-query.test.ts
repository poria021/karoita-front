import { describe, expect, it } from 'vitest';

import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
} from '@/services/org-structure-delete-rules';
import {
  getFilteredSortedRows,
  pageOrgRows,
  pageOrgRowsFromRuntime,
} from '@/services/org-structure/mock-org-query';
import {
  buildOrgRuntimeIndex,
  clearOrgListFilterCache,
  getOrgListFilterCache,
} from '@/services/org-structure/mock-org-store';
import type { OrgStructureSnapshot } from '@/types/org-structure';

const sampleDb: OrgStructureSnapshot = {
  provinces: [
    { id: 'p1', name: 'تهران' },
    { id: 'p2', name: 'ایلام' },
  ],
  cities: [{ id: 'c1', name: 'تهران', provinceId: 'p1' }],
  faculties: [],
  districts: [{ id: 'd1', name: 'ناحیه ۱', provinceId: 'p1', cityId: 'c1' }],
  schools: [
    {
      id: 's1',
      name: 'البرز',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: 'd1',
      gender: 'male',
    },
  ],
  majors: Array.from({ length: 25 }, (_, i) => ({
    id: `m${i + 1}`,
    name: `رشته ${String(i + 1).padStart(2, '0')}`,
    audience: 'student' as const,
  })),
};

describe('buildOrgDeleteBlockedSets', () => {
  it('marks linked province/city/district ids in one pass', () => {
    const sets = buildOrgDeleteBlockedSets(sampleDb);
    expect(sets.provinces.has('p1')).toBe(true);
    expect(sets.provinces.has('p2')).toBe(false);
    expect(sets.cities.has('c1')).toBe(true);
    expect(sets.districts.has('d1')).toBe(true);
    expect(isDeleteBlockedWithSets('province', 'p1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('province', 'p2', sets)).toBe(false);
  });
});

describe('pageOrgRows', () => {
  it('returns only the page slice with correct hasMore/total', () => {
    const page = pageOrgRows(sampleDb, 'majors', '', 0, 10);
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(25);
    expect(page.hasMore).toBe(true);

    const last = pageOrgRows(sampleDb, 'majors', '', 20, 10);
    expect(last.items).toHaveLength(5);
    expect(last.hasMore).toBe(false);
  });

  it('enriches province rows with connected structure counts', () => {
    const page = pageOrgRows(sampleDb, 'provinces', '', 0, 10);
    const tehran = page.items.find((r) => r.id === 'p1');
    const ilam = page.items.find((r) => r.id === 'p2');
    expect(tehran).toMatchObject({
      campusesCount: 0,
      districtsCount: 1,
      schoolsCount: 1,
      usersCount: 0,
    });
    expect(ilam).toMatchObject({
      campusesCount: 0,
      districtsCount: 0,
      schoolsCount: 0,
      usersCount: 0,
    });
  });

  it('enriches school rows with parent names and gender', () => {
    const page = pageOrgRows(sampleDb, 'schools', '', 0, 10);
    expect(page.items[0]).toMatchObject({
      id: 's1',
      gender: 'male',
      districtName: 'ناحیه ۱',
      cityName: 'تهران',
      provinceName: 'تهران',
      usersCount: 0,
    });
  });

  it('enriches city rows with province name and school counts', () => {
    const page = pageOrgRows(sampleDb, 'cities', '', 0, 10);
    expect(page.items[0]).toMatchObject({
      id: 'c1',
      provinceName: 'تهران',
      schoolsCount: 1,
    });
  });

  it('page 1 and page 2 for same query do not overlap and hasMore is correct', () => {
    clearOrgListFilterCache();
    const runtime = buildOrgRuntimeIndex(sampleDb);
    const page1 = pageOrgRowsFromRuntime(runtime, 'majors', '', 0, 10);
    const page2 = pageOrgRowsFromRuntime(runtime, 'majors', '', 10, 10);

    expect(page1.hasMore).toBe(true);
    expect(page2.hasMore).toBe(true);
    expect(page1.total).toBe(25);
    expect(page2.total).toBe(25);

    const ids1 = new Set(page1.items.map((r) => r.id));
    const ids2 = new Set(page2.items.map((r) => r.id));
    for (const id of ids2) {
      expect(ids1.has(id)).toBe(false);
    }

    const cache = getOrgListFilterCache();
    expect(cache?.revision).toBe(runtime.revision);
    expect(cache?.tab).toBe('majors');
    expect(cache?.rows).toHaveLength(25);
  });

  it('sets deleteBlocked from snapshot index for province with children', () => {
    const page = pageOrgRows(sampleDb, 'provinces', '', 0, 10);
    const tehran = page.items.find((r) => r.id === 'p1');
    const ilam = page.items.find((r) => r.id === 'p2');
    expect(tehran?.deleteBlocked).toBe(true);
    expect(ilam?.deleteBlocked).toBe(false);
  });

  it('reuses filtered rows across offsets without rebuilding cache entry', () => {
    clearOrgListFilterCache();
    const runtime = buildOrgRuntimeIndex(sampleDb);
    getFilteredSortedRows(runtime, 'majors', '');
    const firstCache = getOrgListFilterCache();
    getFilteredSortedRows(runtime, 'majors', '');
    const secondCache = getOrgListFilterCache();
    expect(secondCache).toBe(firstCache);
  });
});
