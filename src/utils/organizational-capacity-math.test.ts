import { describe, expect, it } from 'vitest';

import {
  normalizeCapacityTotalInput,
  summarizeCapacityCourses,
} from './organizational-capacity-math';

describe('organizational capacity math', () => {
  it('sums finite totals and remaining seats', () => {
    expect(
      summarizeCapacityCourses([
        {
          id: '1',
          title: 'کارورزی ۱',
          kind: 'internship',
          level: 1,
          total: 10,
          confirmed: 3,
          selectedDays: ['sat'],
        },
        {
          id: '2',
          title: 'کارورزی ۲',
          kind: 'internship',
          level: 2,
          total: 5,
          confirmed: 1,
          selectedDays: ['mon'],
        },
      ])
    ).toEqual({ total: 15, confirmed: 4, remaining: 11 });
  });

  it('treats any null total as unlimited', () => {
    expect(
      summarizeCapacityCourses([
        {
          id: '1',
          title: 'کارآموزی ۱',
          kind: 'apprenticeship',
          level: 1,
          total: null,
          confirmed: 2,
          selectedDays: [],
        },
      ]).total
    ).toBe('unlimited');
  });

  it('clamps capacity input to max', () => {
    expect(normalizeCapacityTotalInput('۹۹', 15)).toBe(15);
    expect(normalizeCapacityTotalInput('7', 15)).toBe(7);
  });
});
