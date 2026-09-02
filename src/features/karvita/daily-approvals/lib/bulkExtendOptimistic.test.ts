import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee, DailyApprovalWeek } from '@/types/daily-approvals';

import {
  applyOptimisticBulkExtendWeeks,
  buildBulkExtendUndoMessage,
} from './bulkExtendOptimistic';

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

describe('applyOptimisticBulkExtendWeeks', () => {
  it('extends and revokes matching non-graded weeks on active trainees', () => {
    const result = applyOptimisticBulkExtendWeeks(
      [
        trainee({
          id: 'a',
          status: 'active',
          weeks: [
            week({ weekNumber: 1, status: 'overdue' }),
            week({ weekNumber: 2, status: 'extended' }),
            week({ weekNumber: 3, status: 'graded', score: 80 }),
          ],
        }),
      ],
      [1],
      [2]
    );

    expect(result[0]?.weeks[0]?.status).toBe('extended');
    expect(result[0]?.weeks[0]?.isExtended).toBe(true);
    expect(result[0]?.weeks[1]?.status).toBe('overdue');
    expect(result[0]?.weeks[1]?.isExtended).toBe(false);
    expect(result[0]?.weeks[2]?.status).toBe('graded');
  });

  it('skips dropped trainees', () => {
    const source = [
      trainee({
        id: 'dropped',
        status: 'dropped',
        weeks: [week({ weekNumber: 1, status: 'overdue' })],
      }),
    ];
    expect(applyOptimisticBulkExtendWeeks(source, [1], [])).toEqual(source);
  });

  it('only patches trainees of the selected course', () => {
    const internTwo = trainee({
      id: 'b',
      status: 'active',
      courseKey: 'intern2',
      weeks: [week({ weekNumber: 1, status: 'overdue' })],
    });
    const result = applyOptimisticBulkExtendWeeks(
      [
        trainee({
          id: 'a',
          status: 'active',
          courseKey: 'intern1',
          weeks: [week({ weekNumber: 1, status: 'overdue' })],
        }),
        internTwo,
      ],
      [1],
      [],
      'intern1'
    );
    expect(result[0]?.weeks[0]?.status).toBe('extended');
    expect(result[1]).toEqual(internTwo);
  });
});

describe('buildBulkExtendUndoMessage', () => {
  it('describes extend and revoke week numbers in Persian digits', () => {
    expect(buildBulkExtendUndoMessage([2, 3], [1])).toBe(
      'مهلت هفته‌های ۲، ۳ تمدید شد و تمدید هفته‌های ۱ لغو شد.'
    );
  });
});
