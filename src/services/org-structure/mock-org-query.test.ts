import { describe, expect, it } from 'vitest';

import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
} from '@/services/org-structure-delete-rules';
import { pageOrgRows } from '@/services/org-structure/mock-org-query';
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
      gender: 'mixed',
    },
  ],
  majors: Array.from({ length: 25 }, (_, i) => ({
    id: `m${i + 1}`,
    name: `رشته ${String(i + 1).padStart(2, '0')}`,
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

  it('sets deleteBlocked from index for province page rows', () => {
    const page = pageOrgRows(sampleDb, 'provinces', '', 0, 10);
    const tehran = page.items.find((r) => r.id === 'p1');
    const ilam = page.items.find((r) => r.id === 'p2');
    expect(tehran?.deleteBlocked).toBe(true);
    expect(ilam?.deleteBlocked).toBe(false);
  });
});
