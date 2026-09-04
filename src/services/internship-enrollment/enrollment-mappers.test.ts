import { afterEach, describe, expect, it, vi } from 'vitest';

import { REAL_MODE_NOT_IMPLEMENTED } from '@/lib/api-mode';
import {
  clampLevel,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import {
  getRealEnrollmentPageState,
  listRealEligibleSupervisors,
} from '@/services/internship-enrollment/real/real-enrollment-reads';

vi.mock('@/services/internship-enrollment/real/real-enrollment-reads', () => ({
  getRealEnrollmentPageState: vi.fn(),
  listRealEligibleSupervisors: vi.fn(),
}));

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

describe('InternshipEnrollmentService real wiring', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(getRealEnrollmentPageState).mockReset();
    vi.mocked(listRealEligibleSupervisors).mockReset();
  });

  it('uses student-enrollments reads and keeps writes stubbed', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(getRealEnrollmentPageState).mockResolvedValue({
      scenario: 'S3_enroll_open',
      kind: 'internship',
      level: 1,
      courseName: 'کارورزی',
      termTitle: 'نیم‌سال اول 1405-1406',
      termId: 'sem-1',
      lessonId: 'les-1',
      enrollment: null,
      selection: null,
      conflictEnrollment: null,
    });
    vi.mocked(listRealEligibleSupervisors).mockResolvedValue([]);

    const actor = {
      id: 'u1',
      role: 'student' as const,
      approved: true,
    };
    await expect(
      InternshipEnrollmentService.getEnrollmentPageState({
        actor,
        level: 1,
      })
    ).resolves.toMatchObject({
      scenario: 'S3_enroll_open',
      lessonId: 'les-1',
    });
    await expect(
      InternshipEnrollmentService.listEligibleSupervisors({
        actor,
        kind: 'internship',
        level: 1,
        query: '',
        province: '',
        college: '',
        semesterId: 'sem-1',
        lessonId: 'les-1',
      })
    ).resolves.toEqual([]);
    expect(getRealEnrollmentPageState).toHaveBeenCalled();
    expect(listRealEligibleSupervisors).toHaveBeenCalled();

    await expect(
      InternshipEnrollmentService.enrollWithSupervisor({
        actor,
        kind: 'internship',
        level: 1,
        termId: 'sem-1',
        supervisorId: 'p1',
      })
    ).rejects.toThrow(REAL_MODE_NOT_IMPLEMENTED);
  });
});
