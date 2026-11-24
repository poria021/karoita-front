import { describe, expect, it } from 'vitest';

import type { NestSemesterEnrolmentsByTerm } from '@/types/nest-student-enrollments';

import {
  resolveDroppedInOpenTerm,
  resolveEffectiveEnrollmentEntry,
} from './enrollment-page-state';
import type { EnrolmentHistoryEntry } from './lesson-matching';

function entry(
  semesterId: string,
  status: 'active' | 'completed',
  createdAt = '2026-01-01'
): EnrolmentHistoryEntry {
  return {
    semesterId,
    lesson: { id: `lesson-${semesterId}`, title: 'کارورزی ۱' },
    enrolment: { id: `e-${semesterId}`, status, createdAt },
  } as unknown as EnrolmentHistoryEntry;
}

const OPEN_ID = 'term2';

describe('resolveEffectiveEnrollmentEntry', () => {
  it('ignores a stale active enrolment from a past term when the open term is selectable', () => {
    const history = [entry('term1', 'active')];
    expect(
      resolveEffectiveEnrollmentEntry({ canSelect: undefined }, history, OPEN_ID)
    ).toBeNull();
  });

  it('keeps an active enrolment in the open term as current', () => {
    const history = [entry('term1', 'active'), entry(OPEN_ID, 'active')];
    expect(
      resolveEffectiveEnrollmentEntry({}, history, OPEN_ID)?.semesterId
    ).toBe(OPEN_ID);
  });

  it('still shows the old active enrolment when the open term has no lesson for this level', () => {
    const history = [entry('term1', 'active')];
    expect(
      resolveEffectiveEnrollmentEntry(null, history, OPEN_ID)?.semesterId
    ).toBe('term1');
  });

  it('still shows the old active enrolment when the backend says canSelect is false', () => {
    const history = [entry('term1', 'active')];
    expect(
      resolveEffectiveEnrollmentEntry({ canSelect: false }, history, OPEN_ID)
        ?.semesterId
    ).toBe('term1');
  });

  it('falls back to the latest completed enrolment only when selection is not available', () => {
    const history = [
      entry('t0', 'completed', '2025-01-01'),
      entry('term1', 'completed', '2026-01-01'),
    ];
    expect(resolveEffectiveEnrollmentEntry({}, history, OPEN_ID)).toBeNull();
    expect(
      resolveEffectiveEnrollmentEntry({ canSelect: false }, history, OPEN_ID)
        ?.semesterId
    ).toBe('term1');
  });
});

const LEAF = { level: 1, title: 'کارورزی 1' } as const;

function openTerm(
  enrolment: Record<string, unknown> | undefined
): NestSemesterEnrolmentsByTerm {
  return {
    id: 'term2',
    lessons: [{ id: 'lesson-1', title: 'کارورزی 1', ...(enrolment ? { enrolment } : {}) }],
  } as unknown as NestSemesterEnrolmentsByTerm;
}

describe('resolveDroppedInOpenTerm', () => {
  it('reports the professor who removed the learner from the open term lesson', () => {
    const term = openTerm({
      id: 'e1',
      status: 'dropped',
      professor: { id: 'p1', firstName: 'اکرم', lastName: 'صفری' },
    });
    const result = resolveDroppedInOpenTerm(term, 'internship', LEAF);
    expect(result.wasDropped).toBe(true);
    expect(result.droppedSupervisorName).toContain('صفری');
  });

  it('still flags the removal when the professor name is not populated', () => {
    const term = openTerm({ id: 'e1', status: 'dropped' });
    expect(resolveDroppedInOpenTerm(term, 'internship', LEAF)).toEqual({
      wasDropped: true,
      droppedSupervisorName: null,
    });
  });

  it('does not treat a self-cancelled enrolment as removed by the professor', () => {
    const term = openTerm({ id: 'e1', status: 'cancelled' });
    expect(resolveDroppedInOpenTerm(term, 'internship', LEAF).wasDropped).toBe(false);
  });

  it('is false for an active or missing enrolment and for a missing term', () => {
    const active = openTerm({ id: 'e1', status: 'active' });
    expect(resolveDroppedInOpenTerm(active, 'internship', LEAF).wasDropped).toBe(false);
    expect(
      resolveDroppedInOpenTerm(openTerm(undefined), 'internship', LEAF).wasDropped
    ).toBe(false);
    expect(resolveDroppedInOpenTerm(undefined, 'internship', LEAF).wasDropped).toBe(false);
  });
});
