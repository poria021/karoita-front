import { describe, expect, it } from 'vitest';

import type { OrgStructureSnapshot } from '@/types/org-structure';

import {
  buildOrgStructureCountMetrics,
  sumOrgStructureCounts,
} from './org-structure-counts';

const snapshot: OrgStructureSnapshot = {
  provinces: [{ id: 'p1', name: 'تهران' }],
  cities: [
    { id: 'c1', name: 'تهران', provinceId: 'p1' },
    { id: 'c2', name: 'ری', provinceId: 'p1' },
  ],
  districts: [],
  schools: [
    {
      id: 's1',
      name: 'نمونه',
      provinceId: 'p1',
      cityId: 'c1',
      gender: 'female',
    },
  ],
  majors: [
    { id: 'm1', name: 'آموزش', audience: 'student' },
    { id: 'm2', name: 'مهارت', audience: 'skill_learner' },
    { id: 'm3', name: 'راهنمایی', audience: 'supervisor_professor' },
  ],
  faculties: [{ id: 'f1', name: 'پردیس', provinceId: 'p1', cityId: 'c1' }],
};

describe('org-structure-counts', () => {
  it('builds six metrics in tab order from the snapshot', () => {
    const metrics = buildOrgStructureCountMetrics(snapshot);
    expect(metrics.map((m) => m.id)).toEqual([
      'provinces',
      'cities',
      'districts',
      'schools',
      'majors',
      'faculties',
    ]);
    expect(metrics.map((m) => m.count)).toEqual([1, 2, 0, 1, 3, 1]);
    expect(sumOrgStructureCounts(metrics)).toBe(8);
  });

  it('returns an empty list without a snapshot', () => {
    expect(buildOrgStructureCountMetrics(null)).toEqual([]);
  });
});
