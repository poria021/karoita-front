import { describe, expect, it } from 'vitest';

import type { OrganizationalCapacitiesSnapshot } from '@/types/organizational-capacities';

import {
  buildCapacityKindStatusView,
  buildCapacityStatusInsight,
  computeFillRatio,
  fillToneForRatio,
} from './capacity-status';

function snapshot(
  patch: Partial<OrganizationalCapacitiesSnapshot> & {
    summary: OrganizationalCapacitiesSnapshot['summary'];
  }
): OrganizationalCapacitiesSnapshot {
  return {
    termId: 't1',
    termTitle: 'نیم‌سال ۱۴۰۴',
    kind: 'internship',
    maxCapacity: 15,
    status: 'draft',
    courses: [
      {
        id: 'c1',
        title: 'کارورزی ۱',
        kind: 'internship',
        total: 10,
        confirmed: 2,
        selectedDays: ['sat'],
      },
    ],
    terms: [{ id: 't1', title: 'نیم‌سال ۱۴۰۴' }],
    ...patch,
  };
}

describe('capacity-status', () => {
  it('computes fill ratio and tone bands', () => {
    expect(computeFillRatio(10, 4)).toBe(0.4);
    expect(computeFillRatio('unlimited', 4)).toBeNull();
    expect(fillToneForRatio(0.4)).toBe('calm');
    expect(fillToneForRatio(0.8)).toBe('watch');
    expect(fillToneForRatio(0.97)).toBe('critical');
    expect(fillToneForRatio(null)).toBe('open');
  });

  it('builds a kind view from a snapshot', () => {
    const view = buildCapacityKindStatusView(
      snapshot({
        summary: { total: 10, confirmed: 8, remaining: 2 },
      })
    );
    expect(view.label).toBe('ترمی');
    expect(view.fillPercent).toBe(80);
    expect(view.tone).toBe('watch');
    expect(view.coursesWithDays).toBe(1);
  });

  it('picks the most urgent insight across kinds', () => {
    const calm = buildCapacityKindStatusView(
      snapshot({
        kind: 'internship',
        summary: { total: 20, confirmed: 4, remaining: 16 },
      })
    );
    const critical = buildCapacityKindStatusView(
      snapshot({
        kind: 'apprenticeship',
        termTitle: 'پودمان بهار',
        summary: { total: 5, confirmed: 5, remaining: 0 },
        courses: [
          {
            id: 'a1',
            title: 'کارآموزی',
            kind: 'apprenticeship',
            total: 5,
            confirmed: 5,
            selectedDays: ['mon'],
          },
        ],
      })
    );
    const insight = buildCapacityStatusInsight([calm, critical]);
    expect(insight.tone).toBe('critical');
    expect(insight.headline).toContain('پودمانی');
  });
});
