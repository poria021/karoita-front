import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '@/services/api-error';
import {
  NEST_STUDENT_ENROLLMENT_PATHS,
  studentEnrollmentsApi,
} from '@/services/internship-enrollment/real/student-enrollments.api';

const getJson = vi.fn();

vi.mock('@/services/api-client', () => ({
  apiClient: {
    getJson: (...args: unknown[]) => getJson(...args),
  },
}));

describe('studentEnrollmentsApi', () => {
  beforeEach(() => {
    getJson.mockReset();
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
});
