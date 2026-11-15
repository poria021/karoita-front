import { describe, expect, it } from 'vitest';

import {
  mapLearnerGradeDetail,
  mapLearnerGradeRow,
  NEST_LEARNERS_GRADES_PATHS,
} from '@/services/reports/real/learners-report.api';

describe('mapLearnerGradeRow', () => {
  it('maps the Nest grade row and status', () => {
    expect(
      mapLearnerGradeRow(
        {
          id: 's1',
          fullName: 'علی رضایی',
          phone: '09120000000',
          mentor: 'دکتر احمدی',
          status: 'passed',
        },
        0
      )
    ).toMatchObject({
      id: 's1',
      name: 'علی رضایی',
      phone: '09120000000',
      profName: 'دکتر احمدی',
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
  it('places week scores by priority and averages the recorded ones', () => {
    const detail = mapLearnerGradeDetail(
      {
        studentId: 's1',
        lessons: [
          {
            lessonId: 'l1',
            title: 'ریاضی',
            isPass: true,
            finalScore: 90,
            weeks: [
              { priority: 1, score: 80 },
              { priority: 3, score: 100 },
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
      name: 'ریاضی',
      average: 90,
      sessions: [80, null, 100],
    });
  });

  it('keeps ids unique and average null when nothing is scored', () => {
    const detail = mapLearnerGradeDetail(
      {
        lessons: [
          { lessonId: 'l1', title: 'الف', weeks: [{ priority: 1, score: null }] },
          { lessonId: 'l1', title: 'الف', weeks: [] },
        ],
      },
      's1',
      ''
    );
    expect(detail.courses[0]?.average).toBeNull();
    expect(detail.courses[0]?.id).not.toBe(detail.courses[1]?.id);
  });
});

describe('NEST_LEARNERS_GRADES_PATHS', () => {
  it('points at the grades endpoints', () => {
    expect(NEST_LEARNERS_GRADES_PATHS.table).toBe('v1/reports/learners/grades');
    expect(NEST_LEARNERS_GRADES_PATHS.export).toBe(
      'v1/reports/learners/grades/export'
    );
  });
});
