import { describe, expect, it } from 'vitest';

import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/mock-enrollment-store';

describe('internship-enrollment mock helpers', () => {
  it('maps role to course kind and labels', () => {
    expect(kindForRole('student')).toBe('internship');
    expect(kindForRole('skill_learner')).toBe('apprenticeship');
    expect(courseNameForKind('internship')).toBe('کارورزی');
    expect(courseNameForKind('apprenticeship')).toBe('کارآموزی');
    expect(maxLevelForKind('internship')).toBe(4);
    expect(maxLevelForKind('apprenticeship')).toBe(2);
  });

  it('clamps level to role max', () => {
    expect(clampLevel('apprenticeship', 4)).toBe(2);
    expect(clampLevel('internship', 3)).toBe(3);
  });

  it('resolves Phase 1 gate scenarios', () => {
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: false,
        enrollOpen: false,
        termOpen: false,
        registered: false,
      })
    ).toBe('S1_syllabus_blocked');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: false,
        registered: false,
      })
    ).toBe('S2_enroll_closed');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: false,
        registered: true,
      })
    ).toBe('S4_registered_waiting');
  });
});
