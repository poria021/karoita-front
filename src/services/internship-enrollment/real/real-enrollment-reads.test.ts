import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getRealEnrollmentPageState,
  listRealEligibleSupervisors,
} from '@/services/internship-enrollment/real/real-enrollment-reads';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  ENROLLMENT_PROFESSORS_PAGE_SIZE: 20,
  studentEnrollmentsApi: {
    getOpenCourseSelection: vi.fn(),
    listProfessors: vi.fn(),
  },
}));

const student: InternshipEnrollmentActor = {
  id: 'u1',
  role: 'student',
  approved: true,
};

describe('real enrollment reads', () => {
  beforeEach(() => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockReset();
    vi.mocked(studentEnrollmentsApi.listProfessors).mockReset();
  });

  it('builds page state from the open semester', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      startClasses: false,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: false }],
    });

    const state = await getRealEnrollmentPageState({
      actor: student,
      level: 1,
    });
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.lessonId).toBe('les-1');
  });

  it('pages professors until hasNextPage is false', async () => {
    vi.mocked(studentEnrollmentsApi.listProfessors)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p1',
            name: 'استاد یک',
            college: '',
            province: '',
            day: '',
            capacity: 1,
          },
        ],
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p2',
            name: 'استاد دو',
            college: '',
            province: '',
            day: '',
            capacity: 1,
          },
        ],
        hasNextPage: false,
      });

    const list = await listRealEligibleSupervisors({
      actor: student,
      kind: 'internship',
      level: 1,
      query: '',
      province: '',
      college: '',
      semesterId: 'sem-1',
      lessonId: 'les-1',
    });

    expect(studentEnrollmentsApi.listProfessors).toHaveBeenCalledTimes(2);
    expect(list.map((item) => item.id)).toEqual(['p1', 'p2']);
  });
});
