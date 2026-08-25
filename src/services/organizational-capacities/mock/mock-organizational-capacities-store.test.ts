import { beforeEach, describe, expect, it } from 'vitest';

import {
  getMockOrganizationalCapacities,
  resetMockOrganizationalCapacitiesForTests,
  submitMockOrganizationalCapacities,
  updateMockOrganizationalCapacityCourse,
} from './mock-organizational-capacities-store';

const ACTOR = 'supervisor-test-1';

describe('mock organizational capacities store', () => {
  beforeEach(() => {
    resetMockOrganizationalCapacitiesForTests(null);
  });

  it('seeds internship courses and keeps a single mutual day', () => {
    const snapshot = getMockOrganizationalCapacities(
      { kind: 'internship', termId: 'term_2' },
      ACTOR
    );
    expect(snapshot.courses).toHaveLength(4);
    expect(snapshot.status).toBe('draft');

    const next = updateMockOrganizationalCapacityCourse(
      {
        kind: 'internship',
        termId: snapshot.termId,
        courseId: snapshot.courses[0]!.id,
        total: 12,
        selectedDays: ['sat', 'mon'],
      },
      ACTOR
    );
    expect(next.courses[0]?.total).toBe(12);
    expect(next.courses[0]?.selectedDays).toEqual(['mon']);
  });

  it('allows updating capacities repeatedly even after submit', () => {
    const snapshot = getMockOrganizationalCapacities(
      { kind: 'apprenticeship', termId: 'term_modular_1' },
      ACTOR
    );
    const submitted = submitMockOrganizationalCapacities(
      {
        kind: 'apprenticeship',
        termId: snapshot.termId,
        courses: snapshot.courses.map((course) => ({
          courseId: course.id,
          total: course.total,
          selectedDays: course.selectedDays,
        })),
      },
      ACTOR
    );
    expect(submitted.status).toBe('draft');

    const updated = updateMockOrganizationalCapacityCourse(
      {
        kind: 'apprenticeship',
        termId: snapshot.termId,
        courseId: snapshot.courses[0]!.id,
        total: 10,
        selectedDays: ['tue'],
      },
      ACTOR
    );
    expect(updated.courses[0]?.total).toBe(10);
  });
});
