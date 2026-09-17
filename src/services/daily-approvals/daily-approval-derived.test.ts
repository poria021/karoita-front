import { describe, expect, it } from 'vitest';

import {
  computeDailyApprovalProgressiveGrade,
  withDerivedDailyApprovalTrainee,
} from '@/services/daily-approvals/daily-approval-derived';
import type { DailyApprovalTrainee, DailyApprovalWeek } from '@/types/daily-approvals';

function week(
  partial: Partial<DailyApprovalWeek> & Pick<DailyApprovalWeek, 'id' | 'weekNumber' | 'status'>
): DailyApprovalWeek {
  return {
    score: null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
    ...partial,
  };
}

describe('computeDailyApprovalProgressiveGrade', () => {
  it('marks dropped trainees as حذف', () => {
    expect(
      computeDailyApprovalProgressiveGrade([], 'dropped', 70).statusLabel
    ).toBe('حذف');
  });

  it('returns فاقد نمره when nothing graded', () => {
    expect(
      computeDailyApprovalProgressiveGrade(
        [week({ id: 'w1', weekNumber: 1, status: 'pending' })],
        'active',
        70
      )
    ).toEqual({ gradedCount: 0, final20: null, statusLabel: 'فاقد نمره' });
  });

  it('computes final20 and pass/fail from graded weeks', () => {
    const weeks = [
      week({ id: 'w1', weekNumber: 1, status: 'graded', score: 80 }),
      week({ id: 'w2', weekNumber: 2, status: 'graded', score: 60 }),
    ];
    expect(computeDailyApprovalProgressiveGrade(weeks, 'active', 70)).toEqual({
      gradedCount: 2,
      final20: 14,
      statusLabel: 'قبول',
    });
    expect(computeDailyApprovalProgressiveGrade(weeks, 'active', 75)).toEqual({
      gradedCount: 2,
      final20: 14,
      statusLabel: 'مردود',
    });
  });
});

describe('withDerivedDailyApprovalTrainee', () => {
  it('marks submitted ungraded rows as در جریان', () => {
    const trainee = {
      id: 't1',
      traineeName: 'آزمایش',
      identifier: '401000001',
      major: 'آموزش',
      schoolName: null,
      kind: 'internship',
      level: 1,
      courseKey: 'intern1',
      courseTitle: 'کارورزی ۱',
      termId: 'term_2',
      termTitle: 'نیم‌سال',
      status: 'active',
      unreadCount: 0,
      hasSubmitted: false,
      progressiveGrade: {
        gradedCount: 0,
        final20: null,
        statusLabel: 'فاقد نمره',
      },
      weeks: [
        week({
          id: 'w1',
          weekNumber: 1,
          status: 'pending',
          readBySupervisor: false,
        }),
      ],
    } satisfies DailyApprovalTrainee;

    const derived = withDerivedDailyApprovalTrainee(trainee, 70);
    expect(derived.hasSubmitted).toBe(true);
    expect(derived.unreadCount).toBe(1);
    expect(derived.progressiveGrade.statusLabel).toBe('در جریان');
  });
});
