import { afterEach, describe, expect, it, vi } from 'vitest';

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
import { enrollRealWithSupervisor } from '@/services/internship-enrollment/real/real-enrollment-writes';

vi.mock('@/services/internship-enrollment/real/real-enrollment-reads', () => ({
  getRealEnrollmentPageState: vi.fn(),
  listRealEligibleSupervisors: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/real-enrollment-writes', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/services/internship-enrollment/real/real-enrollment-writes')
    >();
  return {
    ...actual,
    enrollRealWithSupervisor: vi.fn(),
  };
});

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
    vi.mocked(enrollRealWithSupervisor).mockReset();
  });

  it('uses student-enrollments reads and posts enrollWithSupervisor in real mode', async () => {
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
      termHistory: [],
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

    vi.mocked(enrollRealWithSupervisor).mockResolvedValue({
      id: 'enr-1',
      userId: actor.id,
      role: actor.role,
      kind: 'internship',
      level: 1,
      termId: 'sem-1',
      termTitle: '',
      title: 'کارورزی ۱',
      supervisorId: 'p1',
      supervisorName: null,
      schoolId: null,
      schoolName: null,
      mentorId: null,
      mentorName: null,
      status: 'active',
    });
    await expect(
      InternshipEnrollmentService.enrollWithSupervisor({
        actor,
        kind: 'internship',
        level: 1,
        termId: 'sem-1',
        supervisorId: 'p1',
      })
    ).resolves.toMatchObject({ id: 'enr-1', supervisorId: 'p1' });
    expect(enrollRealWithSupervisor).toHaveBeenCalled();
  });
});
