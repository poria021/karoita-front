import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/services/api-error';
import {
  NEST_STUDENT_ENROLLMENT_PATHS,
  studentEnrollmentsApi,
} from '@/services/internship-enrollment/real/student-enrollments.api';

const getJson = vi.fn();
const patchMaybeJson = vi.fn();
const postJson = vi.fn();

vi.mock('@/services/api-client', () => ({
  apiClient: {
    getJson: (...args: unknown[]) => getJson(...args),
    patchMaybeJson: (...args: unknown[]) => patchMaybeJson(...args),
    postJson: (...args: unknown[]) => postJson(...args),
  },
}));

describe('studentEnrollmentsApi', () => {
  beforeEach(() => {
    getJson.mockReset();
    patchMaybeJson.mockReset();
    postJson.mockReset();
  });

  it('GETs open-course-selection without an api/ prefix', async () => {
    getJson.mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      lessons: [],
    });

    const open = await studentEnrollmentsApi.getOpenCourseSelection();

    expect(getJson).toHaveBeenCalledWith(
      'v1/student-enrollments/open-course-selection'
    );
    expect(NEST_STUDENT_ENROLLMENT_PATHS.openCourseSelection).toBe(
      'v1/student-enrollments/open-course-selection'
    );
    expect(open?.id).toBe('sem-1');
  });

  it('treats 404 as no open semester', async () => {
    getJson.mockRejectedValue(new ApiClientError('not found', 404));
    await expect(
      studentEnrollmentsApi.getOpenCourseSelection()
    ).resolves.toBeNull();
  });

  it('GETs professors with semesterId and lessonId', async () => {
    getJson.mockResolvedValue({
      data: [
        {
          id: 'p1',
          firstName: 'سارا',
          lastName: 'احمدی',
          remainingCapacity: 2,
        },
      ],
      hasNextPage: false,
    });

    const page = await studentEnrollmentsApi.listProfessors({
      semesterId: 'sem-1',
      lessonId: 'les-1',
      page: 1,
      limit: 20,
    });

    expect(getJson).toHaveBeenCalledWith(
      'v1/student-enrollments/professors',
      undefined,
      expect.objectContaining({
        searchParams: {
          semesterId: 'sem-1',
          lessonId: 'les-1',
          page: 1,
          limit: 20,
        },
      })
    );
    expect(page.data[0]?.id).toBe('p1');
    expect(page.hasNextPage).toBe(false);
  });

  it('GETs the list of enrollments for the current user (raw array)', async () => {
    getJson.mockResolvedValue([
      { id: 'e1', studentId: 's1', semesterId: 'sem-1', lessonId: 'les-1' },
    ]);

    const rows = await studentEnrollmentsApi.listMine({ page: 1, limit: 20 });

    expect(getJson).toHaveBeenCalledWith(
      NEST_STUDENT_ENROLLMENT_PATHS.list,
      undefined,
      expect.objectContaining({ searchParams: { page: 1, limit: 20 } })
    );
    expect(NEST_STUDENT_ENROLLMENT_PATHS.list).toBe('v1/student-enrollments');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe('e1');
  });

  it('still parses listMine if the live API wraps the array in {data, hasNextPage}', async () => {
    getJson.mockResolvedValue({
      data: [{ id: 'e1', semesterId: 'sem-1' }],
      hasNextPage: false,
    });

    const rows = await studentEnrollmentsApi.listMine();
    expect(rows[0]?.id).toBe('e1');
  });

  it('GETs a single enrollment by id', async () => {
    getJson.mockResolvedValue({ id: 'e1', semesterId: 'sem-1' });

    const row = await studentEnrollmentsApi.getById('e1');

    expect(getJson).toHaveBeenCalledWith(
      NEST_STUDENT_ENROLLMENT_PATHS.byId('e1')
    );
    expect(NEST_STUDENT_ENROLLMENT_PATHS.byId('e1')).toBe(
      'v1/student-enrollments/e1'
    );
    expect(row?.id).toBe('e1');
  });

  it('treats a 404 on getById as not found', async () => {
    getJson.mockRejectedValue(new ApiClientError('not found', 404));
    await expect(studentEnrollmentsApi.getById('e1')).resolves.toBeNull();
  });

  it('POSTs a new enrollment with semester, lesson, and professor', async () => {
    postJson.mockResolvedValue({
      id: 'e1',
      professorId: 'p1',
      semesterId: 'sem-1',
      lessonId: 'les-1',
    });

    const created = await studentEnrollmentsApi.create({
      semesterId: 'sem-1',
      lessonId: 'les-1',
      professorId: 'p1',
    });

    expect(postJson).toHaveBeenCalledWith('v1/student-enrollments', {
      semesterId: 'sem-1',
      lessonId: 'les-1',
      professorId: 'p1',
    });
    expect(created.id).toBe('e1');
    expect(created.professorId).toBe('p1');
  });

  it('PATCHes school/teacher on an enrollment', async () => {
    patchMaybeJson.mockResolvedValue({
      id: 'e1',
      schoolId: 'sch-1',
      teacherId: 'tch-1',
    });

    const updated = await studentEnrollmentsApi.updateSchoolTeacher('e1', {
      schoolId: 'sch-1',
      teacherId: 'tch-1',
    });

    expect(patchMaybeJson).toHaveBeenCalledWith('v1/student-enrollments/e1', {
      schoolId: 'sch-1',
      teacherId: 'tch-1',
    });
    expect(updated?.schoolId).toBe('sch-1');
  });
});
