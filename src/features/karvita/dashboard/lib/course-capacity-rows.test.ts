import { describe, expect, it } from 'vitest';

import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCourse,
} from '@/types/organizational-capacities';

import { buildCourseCapacityRows } from './course-capacity-rows';

function course(
  patch: Partial<OrganizationalCapacityCourse>
): OrganizationalCapacityCourse {
  return {
    id: 'c1',
    title: 'کارورزی ۱',
    kind: 'internship',
    total: 12,
    confirmed: 3,
    selectedDays: [],
    ...patch,
  };
}

function snapshot(
  courses: OrganizationalCapacityCourse[]
): OrganizationalCapacitiesSnapshot {
  return {
    termId: 't1',
    termTitle: 'ترم ۱',
    kind: 'internship',
    maxCapacity: 30,
    status: 'approved',
    courses,
    summary: { total: 12, confirmed: 3, remaining: 9 },
    terms: [],
  };
}

describe('buildCourseCapacityRows', () => {
  it('computes ratio and tone per course', () => {
    const [row] = buildCourseCapacityRows([snapshot([course({})])]);
    expect(row).toMatchObject({
      title: 'کارورزی ۱',
      total: 12,
      confirmed: 3,
      fillRatio: 0.25,
      tone: 'calm',
    });
  });

  it('marks nearly full courses critical', () => {
    const [row] = buildCourseCapacityRows([
      snapshot([course({ total: 10, confirmed: 10 })]),
    ]);
    expect(row?.tone).toBe('critical');
  });

  it('keeps unlimited courses with a null ratio', () => {
    const [row] = buildCourseCapacityRows([
      snapshot([course({ total: null, confirmed: 4 })]),
    ]);
    expect(row).toMatchObject({ total: null, fillRatio: null, tone: 'open' });
  });

  it('drops inactive courses and courses without a cap', () => {
    const rows = buildCourseCapacityRows([
      snapshot([
        course({ id: 'a', isActive: false }),
        course({ id: 'b', total: 0 }),
        course({ id: 'c' }),
      ]),
    ]);
    expect(rows.map((row) => row.id)).toEqual(['internship:c']);
  });
});
