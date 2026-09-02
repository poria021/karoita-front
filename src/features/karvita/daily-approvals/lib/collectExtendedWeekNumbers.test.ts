import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee, DailyApprovalWeek } from '@/types/daily-approvals';

import { collectExtendedWeekNumbers } from './collectExtendedWeekNumbers';

function week(
  partial: Pick<DailyApprovalWeek, 'weekNumber' | 'status'> &
    Partial<DailyApprovalWeek>
): DailyApprovalWeek {
  return {
    id: `w-${partial.weekNumber}`,
    score: null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
    isExtended: partial.status === 'extended',
    ...partial,
  };
}

function trainee(
  partial: Partial<DailyApprovalTrainee> &
    Pick<DailyApprovalTrainee, 'id' | 'status' | 'weeks'>
): DailyApprovalTrainee {
  return {
    traineeName: 'Test',
    identifier: '1',
    major: 'm',
    schoolName: null,
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: 'کارورزی ۱',
    termId: 't1',
    termTitle: 'ترم',
    unreadCount: 0,
    hasSubmitted: false,
    progressiveGrade: {
      gradedCount: 0,
      final20: null,
      statusLabel: 'در جریان',
    },
    ...partial,
  };
}

describe('collectExtendedWeekNumbers', () => {
  it('returns sorted unique week numbers marked extended on active trainees', () => {
    const result = collectExtendedWeekNumbers([
      trainee({
        id: 'a',
        status: 'active',
        weeks: [
          week({ weekNumber: 3, status: 'extended' }),
          week({ weekNumber: 1, status: 'pending' }),
          week({ weekNumber: 5, status: 'overdue', isExtended: true }),
        ],
      }),
      trainee({
        id: 'b',
        status: 'active',
        weeks: [week({ weekNumber: 3, status: 'extended' })],
      }),
    ]);
    expect(result).toEqual([3, 5]);
  });

  it('can scope extended weeks to one course', () => {
    const result = collectExtendedWeekNumbers(
      [
        trainee({
          id: 'a',
          status: 'active',
          courseKey: 'intern1',
          weeks: [week({ weekNumber: 2, status: 'extended' })],
        }),
        trainee({
          id: 'b',
          status: 'active',
          courseKey: 'intern2',
          weeks: [week({ weekNumber: 4, status: 'extended' })],
        }),
      ],
      'intern1'
    );
    expect(result).toEqual([2]);
  });

  it('ignores dropped trainees', () => {
    const result = collectExtendedWeekNumbers([
      trainee({
        id: 'dropped',
        status: 'dropped',
        weeks: [week({ weekNumber: 2, status: 'extended' })],
      }),
    ]);
    expect(result).toEqual([]);
  });
});
