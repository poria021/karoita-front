import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getJson } = vi.hoisted(() => ({ getJson: vi.fn() }));

vi.mock('@/services/api-client', async () => {
  const { ApiClientError } = await import('@/services/api-error');
  return {
    ApiClientError,
    apiClient: { getJson, baseUrl: 'http://localhost/api/nest' },
  };
});

import {
  fetchLearnersFilterBoxes,
  fetchLearnersPage,
  mapLearnerGradeDetail,
  mapLearnerGradeRow,
  NEST_LEARNERS_GRADES_PATHS,
} from '@/services/reports/real/learners-report.api';
import type { ReportPeriodState } from '@/types/reports';

const TERM: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
  semesterId: 's1',
};

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('mapLearnerGradeRow', () => {
  it('maps the Nest grade row like learners plus status', () => {
    expect(
      mapLearnerGradeRow(
        {
          id: 's1',
          fullName: 'علی رضایی',
          phone: '09120000000',
          degree: 'کارشناسی',
          lessons: { title: 'کارورزی', extraCount: 1 },
          university: 'فنی',
          province: 'قم',
          school: { title: 'نمونه', district: 'منطقه ۱' },
          mentor: 'دکتر احمدی',
          teacher: 'خانم رضایی',
          status: 'passed',
          scores: [
            {
              lessonTitle: 'کارورزی',
              finalScore: 80,
              weeks: [{ priority: 1, score: 16 }],
            },
          ],
        },
        0
      )
    ).toMatchObject({
      id: 's1',
      name: 'علی رضایی',
      phone: '09120000000',
      major: 'کارشناسی',
      courses: ['کارورزی'],
      courseExtraCount: 1,
      facName: 'فنی',
      provName: 'قم',
      schoolName: 'نمونه',
      regionName: 'منطقه ۱',
      profName: 'دکتر احمدی',
      teacherName: 'خانم رضایی',
      status: 'pass',
    });
  });

  it('maps failed / not_recorded and fills a dash for a missing mentor', () => {
    const failed = mapLearnerGradeRow(
      { id: 's2', fullName: 'الف', mentor: null, status: 'failed' },
      1
    );
    expect(failed?.status).toBe('fail');
    expect(failed?.profName).toBe('—');
    expect(
      mapLearnerGradeRow({ id: 's3', fullName: 'ب', status: 'not_recorded' }, 2)
        ?.status
    ).toBe('none');
  });

  it('returns null for non-object rows', () => {
    expect(mapLearnerGradeRow(null, 0)).toBeNull();
  });
});

describe('mapLearnerGradeDetail', () => {
  it('uses finalScore and places week scores by priority', () => {
    const detail = mapLearnerGradeDetail(
      {
        studentId: 's1',
        scores: [
          {
            lessonTitle: 'کارورزی',
            finalScore: 80,
            weeks: [
              { priority: 1, score: 16 },
              { priority: 3, score: 18 },
            ],
          },
        ],
      },
      's1',
      'علی رضایی'
    );
    expect(detail.learnerName).toBe('علی رضایی');
    expect(detail.courses).toHaveLength(1);
    expect(detail.courses[0]).toMatchObject({
      name: 'کارورزی',
      average: 80,
      sessions: [16, null, 18],
    });
  });

  it('keeps finalScore null when the term is still open', () => {
    const detail = mapLearnerGradeDetail(
      {
        scores: [
          {
            lessonTitle: 'الف',
            finalScore: null,
            weeks: [{ priority: 1, score: 12 }],
          },
        ],
      },
      's1',
      ''
    );
    expect(detail.courses[0]?.average).toBeNull();
    expect(detail.courses[0]?.sessions).toEqual([12]);
  });
});

describe('NEST_LEARNERS_GRADES_PATHS', () => {
  it('points at the grades endpoints including filters', () => {
    expect(NEST_LEARNERS_GRADES_PATHS.filters).toBe(
      'v1/reports/filters/learners_grades'
    );
    expect(NEST_LEARNERS_GRADES_PATHS.table).toBe('v1/reports/learners/grades');
    expect(NEST_LEARNERS_GRADES_PATHS.export).toBe(
      'v1/reports/learners/grades/export'
    );
  });
});

describe('learners grades filters and table query', () => {
  beforeEach(() => {
    getJson.mockReset();
  });

  it('loads filter boxes from learners_grades without city', async () => {
    getJson.mockResolvedValue({
      educationalDistricts: [{ id: 'd1', title: 'منطقه ۱' }],
      universities: [{ id: 'u1', title: 'فنی' }],
      schools: [{ id: 'sch1', title: 'نمونه' }],
    });
    const boxes = await fetchLearnersFilterBoxes(
      { province: 'p1', city: 'c1' },
      TERM,
      NEST_LEARNERS_GRADES_PATHS
    );
    expect(getJson.mock.calls[0]![0]).toBe(
      'v1/reports/filters/learners_grades'
    );
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      structure: 'semester',
      semesterId: 's1',
    });
    expect(boxes.region).toEqual({
      status: 'ok',
      options: [{ value: 'd1', label: 'منطقه ۱' }],
    });
    expect(boxes.city).toBeUndefined();
    expect(boxes.province).toEqual({ status: 'absent' });
  });

  it('sends org filters on the grades table but never cityId', async () => {
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchLearnersPage({
      filters: {
        province: 'p1',
        city: 'c1',
        region: 'd1',
        faculty: 'u1',
      },
      query: 'علی',
      period: TERM,
      page: 1,
      paths: NEST_LEARNERS_GRADES_PATHS,
      mapRow: mapLearnerGradeRow,
    });
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/learners/grades');
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      educationalDistrictId: 'd1',
      universityId: 'u1',
      structure: 'semester',
      semesterId: 's1',
      search: 'علی',
      page: 1,
      limit: 20,
    });
  });
});
