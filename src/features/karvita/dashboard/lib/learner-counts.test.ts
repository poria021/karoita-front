import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee } from '@/types/daily-approvals';

import { buildLearnerCounts } from './learner-counts';

function trainee(
  overrides: Partial<DailyApprovalTrainee> & Pick<DailyApprovalTrainee, 'id'>
): DailyApprovalTrainee {
  return {
    traineeName: 'فراگیر',
    identifier: '1',
    major: '',
    schoolName: null,
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: '',
    termId: 't1',
    termTitle: '',
    status: 'active',
    unreadCount: 0,
    hasSubmitted: false,
    progressiveGrade: { gradedCount: 0, final20: null, statusLabel: 'فاقد نمره' },
    weeks: [],
    ...overrides,
  };
}

describe('buildLearnerCounts', () => {
  it('returns zeros for an empty list', () => {
    expect(buildLearnerCounts([])).toEqual({
      students: 0,
      skillLearners: 0,
      teachers: 0,
      truncated: false,
    });
  });

  it('counts students (internship) and skill learners (apprenticeship) separately', () => {
    const counts = buildLearnerCounts([
      trainee({ id: 'a', kind: 'internship' }),
      trainee({ id: 'b', kind: 'internship' }),
      trainee({ id: 'c', kind: 'internship' }),
      trainee({ id: 'd', kind: 'apprenticeship', courseKey: 'appr1' }),
      trainee({ id: 'e', kind: 'apprenticeship', courseKey: 'appr2' }),
    ]);
    expect(counts.students).toBe(3);
    expect(counts.skillLearners).toBe(2);
  });

  it('ignores dropped learners everywhere, including the teacher count', () => {
    const counts = buildLearnerCounts([
      trainee({ id: 'a', teacherId: 't1' }),
      trainee({ id: 'b', status: 'dropped', teacherId: 't2' }),
      trainee({
        id: 'c',
        kind: 'apprenticeship',
        status: 'dropped',
        courseKey: 'appr1',
      }),
    ]);
    expect(counts.students).toBe(1);
    expect(counts.skillLearners).toBe(0);
    expect(counts.teachers).toBe(1);
  });

  it('counts each teacher once and skips missing or blank teacher ids', () => {
    const counts = buildLearnerCounts([
      trainee({ id: 'a', teacherId: 't1' }),
      trainee({ id: 'b', teacherId: 't1' }),
      trainee({ id: 'c', kind: 'apprenticeship', teacherId: 't2' }),
      trainee({ id: 'd', teacherId: null }),
      trainee({ id: 'e', teacherId: '   ' }),
      trainee({ id: 'f' }),
    ]);
    expect(counts.teachers).toBe(2);
    expect(counts.students).toBe(5);
    expect(counts.skillLearners).toBe(1);
  });

  it('passes the truncated flag through', () => {
    expect(buildLearnerCounts([], true).truncated).toBe(true);
    expect(buildLearnerCounts([]).truncated).toBe(false);
  });
});
