import { describe, expect, it } from 'vitest';

import {
  buildOrgStructureCountMetrics,
  sumOrgStructureCounts,
} from './org-structure-counts';

describe('org-structure-counts', () => {
  it('builds six metrics in tab order from the counts', () => {
    const metrics = buildOrgStructureCountMetrics({
      provinces: 1,
      cities: 2,
      districts: 0,
      schools: 1,
      majors: 3,
      faculties: 1,
    });
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
    // کارت‌ها همه آبی برند؛ رنگ‌های قطاع فقط برای دونات فرق می‌کنند.
    expect(
      new Set(metrics.map((m) => m.iconWrapClassName)).size
    ).toBe(1);
    expect(metrics[0]?.iconWrapClassName).toBe(
      'bg-kv-brand-soft text-kv-brand-soft-fg'
    );
  });

  it('returns an empty list without counts', () => {
    expect(buildOrgStructureCountMetrics(null)).toEqual([]);
  });
});
