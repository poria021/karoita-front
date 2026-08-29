import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clampLevel,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { REAL_MODE_NOT_IMPLEMENTED } from '@/lib/api-mode';

describe('enrollment mappers (stable Nest contract)', () => {
  it('maps role → kind and clamps skill-learner to two levels', () => {
    expect(kindForRole('skill_learner')).toBe('apprenticeship');
    expect(kindForRole('student')).toBe('internship');
    expect(maxLevelForKind('apprenticeship')).toBe(2);
    expect(maxLevelForKind('internship')).toBe(4);
    expect(clampLevel('apprenticeship', 4)).toBe(2);
    expect(clampLevel('internship', 1)).toBe(1);
    expect(
      InternshipEnrollmentService.resolveLevelForRole('skill_learner', 4)
    ).toEqual({ kind: 'apprenticeship', level: 2, maxLevel: 2 });
  });

  it('resolves S1–S5 from syllabus/enroll/term flags', () => {
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
        enrollOpen: true,
        termOpen: false,
        registered: false,
      })
    ).toBe('S3_enroll_open');
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: true,
        termOpen: false,
        registered: true,
      })
    ).toBe('S4_registered_waiting');
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: true,
        termOpen: true,
        registered: true,
      })
    ).toBe('S5_term_active');
  });
});

describe('InternshipEnrollmentService real fail-closed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not invent enrollment data when Nest routes are absent', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    await expect(
      InternshipEnrollmentService.getEnrollmentPageState({
        actor: {
          id: 'u1',
          role: 'student',
          approved: true,
        },
        level: 1,
      })
    ).rejects.toThrow(REAL_MODE_NOT_IMPLEMENTED);
  });
});
