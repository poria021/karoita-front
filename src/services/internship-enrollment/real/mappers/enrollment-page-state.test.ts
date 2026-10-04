import { describe, expect, it } from 'vitest';

import { resolveEffectiveEnrollmentEntry } from './enrollment-page-state';
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
