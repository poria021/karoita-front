import { describe, expect, it } from 'vitest';

import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';

import {
  buildCoursePendingReports,
  isPendingReportStatus,
} from './course-pending-reports';

function week(status: DailyApprovalWeekState, index: number): DailyApprovalWeek {
  return {
    id: `w${index}`,
    weekNumber: index + 1,
    status,
    score: null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
  };
}

function trainee(
  over: Partial<DailyApprovalTrainee> & { statuses?: DailyApprovalWeekState[] }
): DailyApprovalTrainee {
  const { statuses = [], ...rest } = over;
  return {
    id: 't',
    traineeName: 'فراگیر',
    identifier: '1',
    major: '',
    schoolName: null,
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: 'کارورزی ۱',
    termId: 'term',
    termTitle: '',
    status: 'active',
    unreadCount: 0,
    hasSubmitted: true,
    progressiveGrade: { gradedCount: 0, final20: null, statusLabel: 'در جریان' },
    weeks: statuses.map(week),
    ...rest,
  };
}

describe('course pending reports', () => {
  it('فقط «ارسال‌شده» و «تأیید معلم» در انتظار استاد حساب می‌شوند', () => {
    expect(isPendingReportStatus('pending')).toBe(true);
    expect(isPendingReportStatus('approved')).toBe(true);
    for (const status of [
      'draft',
      'needs_edit',
      'graded',
      'archived',
      'locked_future',
      'overdue',
      'extended',
      'locked_dropped',
    ] as const) {
      expect(isPendingReportStatus(status)).toBe(false);
    }
  });

  it('به‌ازای هر درس جمع، تفکیک و شمار فراگیران منتظر را می‌دهد', () => {
    const summary = buildCoursePendingReports([
      trainee({ id: 'a', statuses: ['graded', 'pending', 'approved'] }),
      trainee({ id: 'b', statuses: ['pending', 'draft'] }),
      trainee({ id: 'c', statuses: ['graded'] }),
    ]);
    expect(summary.courses).toHaveLength(1);
    expect(summary.courses[0]).toMatchObject({
      courseTitle: 'کارورزی ۱',
      pending: 3,
      submitted: 2,
      teacherApproved: 1,
      learners: 3,
      learnersWaiting: 2,
    });
    expect(summary.total).toBe(3);
  });

  it('فراگیر حذف‌شده و درس بدون گزارش در انتظار را از لیست حذف می‌کند', () => {
    const summary = buildCoursePendingReports([
      trainee({ id: 'a', statuses: ['pending'], status: 'dropped' }),
      trainee({
        id: 'b',
        kind: 'apprenticeship',
        courseKey: 'appr1',
        courseTitle: 'کارآموزی ۱',
        statuses: ['graded'],
      }),
    ]);
    expect(summary.courses).toEqual([]);
    expect(summary.total).toBe(0);
  });

  it('ترتیب: بیشترین گزارش اول؛ در تساوی کارورزی پیش از کارآموزی', () => {
    const summary = buildCoursePendingReports([
      trainee({
        id: 'a',
        kind: 'apprenticeship',
        level: 1,
        courseKey: 'appr1',
        courseTitle: 'کارآموزی ۱',
        statuses: ['pending', 'pending', 'pending'],
      }),
      trainee({
        id: 'b',
        level: 2,
        courseKey: 'intern2',
        courseTitle: 'کارورزی ۲',
        statuses: ['approved'],
      }),
      trainee({
        id: 'c',
        level: 1,
        courseKey: 'intern1',
        courseTitle: 'کارورزی ۱',
        statuses: ['pending', 'pending'],
      }),
      trainee({
        id: 'd',
        level: 3,
        courseKey: 'intern3',
        courseTitle: 'کارورزی ۳',
        statuses: ['graded'],
      }),
    ]);
    expect(summary.courses.map((c) => [c.courseTitle, c.pending])).toEqual([
      ['کارآموزی ۱', 3],
      ['کارورزی ۱', 2],
      ['کارورزی ۲', 1],
    ]);
  });

  it('عنوان خالی از نام مسیر و سطح ساخته می‌شود و truncated حفظ می‌شود', () => {
    const summary = buildCoursePendingReports(
      [trainee({ id: 'a', courseTitle: '  ', statuses: ['pending'] })],
      true
    );
    expect(summary.courses[0]!.courseTitle).toContain('۱');
    expect(summary.truncated).toBe(true);
  });

});
