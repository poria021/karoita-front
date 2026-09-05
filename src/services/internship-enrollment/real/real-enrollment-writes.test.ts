import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/services/api-error';
import { assignRealDelayedSchoolMentor } from '@/services/internship-enrollment/real/real-enrollment-writes';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import type { AssignDelayedSchoolMentorInput } from '@/types/internship-enrollment';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  studentEnrollmentsApi: {
    getOpenCourseSelection: vi.fn(),
    listMine: vi.fn(),
    updateSchoolTeacher: vi.fn(),
  },
}));

const input: AssignDelayedSchoolMentorInput = {
  actor: { id: 'u1', role: 'student', approved: true },
  kind: 'internship',
  level: 1,
  termId: 'sem-1',
  schoolId: 'sch-1',
  mentorId: 'tch-1',
};

describe('assignRealDelayedSchoolMentor', () => {
  beforeEach(() => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockReset();
    vi.mocked(studentEnrollmentsApi.listMine).mockReset();
    vi.mocked(studentEnrollmentsApi.updateSchoolTeacher).mockReset();
  });

  it('finds the enrollment for the current lesson and PATCHes school/teacher', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      lessons: [{ id: 'les-1', title: 'کارورزی ۱', status: true }],
    });
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      { id: 'enr-1', lessonId: 'les-1', semesterId: 'sem-1', professorId: 'prof-1' },
    ]);
    vi.mocked(studentEnrollmentsApi.updateSchoolTeacher).mockResolvedValue({
      id: 'enr-1',
      schoolId: 'sch-1',
      teacherId: 'tch-1',
      status: 'active',
    });

    const record = await assignRealDelayedSchoolMentor(input);

    expect(studentEnrollmentsApi.updateSchoolTeacher).toHaveBeenCalledWith(
      'enr-1',
      { schoolId: 'sch-1', teacherId: 'tch-1' }
    );
    expect(record.id).toBe('enr-1');
    expect(record.schoolId).toBe('sch-1');
    expect(record.mentorId).toBe('tch-1');
    expect(record.supervisorId).toBe('prof-1');
    expect(record.status).toBe('active');
  });

  it('falls back to matching by termId if the open lesson cannot be resolved', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([
      { id: 'enr-2', semesterId: 'sem-1' },
    ]);
    vi.mocked(studentEnrollmentsApi.updateSchoolTeacher).mockResolvedValue({
      id: 'enr-2',
      schoolId: 'sch-1',
      teacherId: 'tch-1',
    });

    const record = await assignRealDelayedSchoolMentor(input);
    expect(record.id).toBe('enr-2');
  });

  it('throws a 404 ApiClientError when no matching enrollment exists', async () => {
    vi.mocked(studentEnrollmentsApi.getOpenCourseSelection).mockResolvedValue(null);
    vi.mocked(studentEnrollmentsApi.listMine).mockResolvedValue([]);

    await expect(assignRealDelayedSchoolMentor(input)).rejects.toBeInstanceOf(
      ApiClientError
    );
    expect(studentEnrollmentsApi.updateSchoolTeacher).not.toHaveBeenCalled();
  });
});
