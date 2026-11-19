import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee } from '@/types/daily-approvals';

import {
  buildCourseGradeAverages,
  buildCourseGradeChartRows,
} from './course-grade-averages';

function trainee(
  overrides: Partial<DailyApprovalTrainee> & Pick<DailyApprovalTrainee, 'id'>,
  final20: number | null = null
): DailyApprovalTrainee {
  return {
    traineeName: 'فراگیر',
    identifier: '1',
    major: '',
    schoolName: null,
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: 'کارورزی ۱',
    termId: 't1',
    termTitle: '',
    status: 'active',
    unreadCount: 0,
    hasSubmitted: false,
    progressiveGrade: {
      gradedCount: final20 == null ? 0 : 1,
      final20,
      statusLabel: final20 == null ? 'فاقد نمره' : 'قبول',
    },
    weeks: [],
    ...overrides,
  };
}

describe('buildCourseGradeAverages', () => {
  it('returns no courses for an empty list', () => {
    expect(buildCourseGradeAverages([])).toEqual({
      courses: [],
      truncated: false,
    });
  });

  it('averages the final /20 grades per course', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a' }, 18),
      trainee({ id: 'b' }, 14),
      trainee({ id: 'c', courseKey: 'intern2', level: 2, courseTitle: 'کارورزی ۲' }, 15),
    ]);
    expect(courses.map((c) => [c.courseKey, c.average, c.gradedCount])).toEqual([
      ['intern1', 16, 2],
      ['intern2', 15, 1],
    ]);
  });

  it('skips dropped learners and learners without a final grade', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a' }, 12),
      trainee({ id: 'b', status: 'dropped' }, 20),
      trainee({ id: 'c' }, null),
    ]);
    expect(courses).toHaveLength(1);
    expect(courses[0]).toMatchObject({ average: 12, gradedCount: 1 });
  });

  it('omits a course that has no graded learner at all', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a', courseKey: 'intern3', level: 3 }, null),
    ]);
    expect(courses).toEqual([]);
  });

  it('rounds the average to two decimals', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a' }, 10),
      trainee({ id: 'b' }, 10),
      trainee({ id: 'c' }, 11),
    ]);
    expect(courses[0]!.average).toBe(10.33);
  });

  it('keeps internship before apprenticeship, then orders by level', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a', kind: 'apprenticeship', courseKey: 'appr1', level: 1, courseTitle: 'کارآموزی ۱' }, 17),
      trainee({ id: 'b', courseKey: 'intern2', level: 2, courseTitle: 'کارورزی ۲' }, 15),
      trainee({ id: 'c' }, 13),
    ]);
    expect(courses.map((c) => c.courseKey)).toEqual(['intern1', 'intern2', 'appr1']);
    expect(new Set(courses.map((c) => c.id)).size).toBe(3);
  });

  it('falls back to a kind + level title when the course title is blank', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a', courseTitle: '  ' }, 16),
      trainee({ id: 'b', kind: 'apprenticeship', courseKey: 'appr2', level: 2, courseTitle: '' }, 16),
    ]);
    expect(courses.map((c) => c.courseTitle)).toEqual(['کارورزی ۱', 'کارآموزی ۲']);
  });

  it('passes the truncated flag through', () => {
    expect(buildCourseGradeAverages([], true).truncated).toBe(true);
  });
});

describe('buildCourseGradeChartRows', () => {
  it('builds one row per course carrying only that course series value', () => {
    const { courses } = buildCourseGradeAverages([
      trainee({ id: 'a' }, 18),
      trainee({ id: 'b', courseKey: 'intern2', level: 2, courseTitle: 'کارورزی ۲' }, 12),
    ]);
    const rows = buildCourseGradeChartRows(courses);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ courseLabel: 'کارورزی ۱', 'course-0': 18 });
    expect(rows[0]).not.toHaveProperty('course-1');
    expect(rows[1]).toMatchObject({ courseLabel: 'کارورزی ۲', 'course-1': 12 });
  });
});
