import { describe, expect, it } from 'vitest';

import type { OrganizationalCapacityCourse } from '@/types/organizational-capacities';

import { groupCapacityCourses } from './groupCapacityCourses';

function course(
  id: string,
  extra: Partial<OrganizationalCapacityCourse> = {}
): OrganizationalCapacityCourse {
  return {
    id,
    title: id,
    kind: 'internship',
    total: 10,
    confirmed: 2,
    selectedDays: [],
    ...extra,
  };
}

describe('groupCapacityCourses', () => {
  it('keeps standalone courses single and gathers sub-modules under their group', () => {
    const segments = groupCapacityCourses([
      course('a1', { groupId: 'g1', groupTitle: 'کارورزی' }),
      course('solo'),
      course('a2', { groupId: 'g1', groupTitle: 'کارورزی', total: 5, confirmed: 1 }),
    ]);
    expect(segments.map((s) => s.kind)).toEqual(['group', 'single']);
    const group = segments[0]!;
    if (group.kind !== 'group') throw new Error('expected group');
    expect(group.items.map((row) => row.index)).toEqual([0, 2]);
    expect(group.summary).toEqual({ total: 15, confirmed: 3, remaining: 12 });
  });
});
