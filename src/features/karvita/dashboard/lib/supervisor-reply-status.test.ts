import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee, DailyApprovalWeek } from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';

import {
  buildSupervisorReplyStatusSummary,
  countWeekReplyBuckets,
  dailyApprovalsCourseHref,
  findEvaluationModuleId,
  buildMonitorCourseShelf,
  mergeSupervisorReplyStatusSummaries,
  pendingHeatFactor,
  toneForReplyStatus,
} from './supervisor-reply-status';

function week(
  status: DailyApprovalWeek['status'],
  weekNumber = 1,
  patch: Partial<DailyApprovalWeek> = {}
): DailyApprovalWeek {
  return {
    id: `w-${weekNumber}`,
    weekNumber,
    status,
    score: status === 'graded' ? 80 : null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
    ...patch,
  };
}

function trainee(
  patch: Partial<DailyApprovalTrainee> &
    Pick<DailyApprovalTrainee, 'id' | 'courseKey' | 'weeks'>
): DailyApprovalTrainee {
  return {
    traineeName: 'آزمودنی',
    identifier: patch.id,
    major: '',
    schoolName: null,
    kind: 'internship',
    level: 1,
    courseTitle: 'کارورزی ۱',
    termId: 't1',
    termTitle: 'نیم‌سال',
    status: 'active',
    unreadCount: 0,
    hasSubmitted: true,
    progressiveGrade: {
      gradedCount: 0,
      final20: null,
      statusLabel: 'در جریان',
    },
    ...patch,
  };
}

const CATALOG = {
  semester: [
    {
      id: 'course_internship',
      title: 'کارورزی',
      audience: 'semester',
      isActive: true,
      subModules: [
        { id: 'course_internship_1', title: 'کارورزی ۱' },
        { id: 'course_internship_2', title: 'کارورزی ۲' },
      ],
    },
  ] satisfies CourseDefinition[],
  modular: [
    {
      id: 'course_apprenticeship',
      title: 'کارآموزی',
      audience: 'modular',
      isActive: true,
      subModules: [{ id: 'course_apprenticeship_1', title: 'کارآموزی ۱' }],
    },
  ] satisfies CourseDefinition[],
};

describe('supervisor-reply-status', () => {
  it('counts pending/approved as awaiting and graded/needs_edit as answered', () => {
    expect(
      countWeekReplyBuckets([
        week('pending', 1),
        week('approved', 2),
        week('graded', 3),
        week('needs_edit', 4),
        week('draft', 5),
      ])
    ).toEqual({ pending: 2, answered: 2 });
  });

  it('counts mentor pending until teacherStatus send or graded', () => {
    expect(
      countWeekReplyBuckets(
        [
          week('pending', 1),
          week('approved', 2, { teacherStatus: 'send' }),
          week('graded', 3),
          week('draft', 4),
        ],
        'mentor_teacher'
      )
    ).toEqual({ pending: 1, answered: 2 });
  });

  it('aggregates per course and sorts by pending desc', () => {
    const summary = buildSupervisorReplyStatusSummary({
      termId: 't1',
      termTitle: 'نیم‌سال ۱۴۰۴',
      trainees: [
        trainee({
          id: 'a',
          courseKey: 'intern1',
          courseTitle: 'کارورزی ۱',
          weeks: [week('pending', 1), week('graded', 2)],
        }),
        trainee({
          id: 'b',
          courseKey: 'intern2',
          courseTitle: 'کارورزی ۲',
          weeks: [week('pending', 1), week('pending', 2), week('approved', 3)],
        }),
        trainee({
          id: 'c',
          courseKey: 'intern1',
          courseTitle: 'کارورزی ۱',
          weeks: [week('needs_edit', 1)],
        }),
      ],
    });

    expect(summary.pendingTotal).toBe(4);
    expect(summary.answeredTotal).toBe(2);
    expect(summary.courses[0]?.courseKey).toBe('intern2');
    expect(summary.courses[0]?.pending).toBe(3);
    expect(summary.courses[1]?.courseKey).toBe('intern1');
    expect(summary.courses[1]?.answered).toBe(2);
    expect(summary.courses[1]?.pending).toBe(1);
  });

  it('merges summaries across kinds', () => {
    const a = buildSupervisorReplyStatusSummary({
      termId: 't1',
      termTitle: 'ترم',
      trainees: [
        trainee({
          id: 'a',
          courseKey: 'intern1',
          weeks: [week('pending', 1)],
        }),
      ],
    });
    const b = buildSupervisorReplyStatusSummary({
      termId: 't2',
      termTitle: 'ترم ۲',
      trainees: [
        trainee({
          id: 'b',
          courseKey: 'appr1',
          kind: 'apprenticeship',
          courseTitle: 'کارآموزی ۱',
          weeks: [week('graded', 1)],
        }),
      ],
    });
    const merged = mergeSupervisorReplyStatusSummaries([a, b]);
    expect(merged?.courses).toHaveLength(2);
    expect(merged?.pendingTotal).toBe(1);
    expect(merged?.answeredTotal).toBe(1);
  });

  it('marks clear tone when nothing is pending', () => {
    expect(toneForReplyStatus(0, 100)).toBe('clear');
    expect(toneForReplyStatus(9, 40)).toBe('critical');
  });

  it('builds a priority shelf with card cap and clear fold', () => {
    const courses = [
      {
        courseKey: 'a',
        courseTitle: 'الف',
        kind: 'internship' as const,
        pending: 9,
        answered: 1,
        total: 10,
        fillPercent: 10,
        tone: 'critical' as const,
      },
      {
        courseKey: 'b',
        courseTitle: 'ب',
        kind: 'internship' as const,
        pending: 0,
        answered: 5,
        total: 5,
        fillPercent: 100,
        tone: 'clear' as const,
      },
      {
        courseKey: 'c',
        courseTitle: 'ج',
        kind: 'internship' as const,
        pending: 2,
        answered: 1,
        total: 3,
        fillPercent: 33,
        tone: 'watch' as const,
      },
    ];
    const shelf = buildMonitorCourseShelf(courses, 1);
    expect(shelf.spotlight).toHaveLength(1);
    expect(shelf.spotlight[0]?.courseKey).toBe('a');
    expect(shelf.overflowQueued).toHaveLength(1);
    expect(shelf.overflowQueued[0]?.courseKey).toBe('c');
    expect(shelf.clearCount).toBe(1);
  });

  it('maps pending heat from yellow (min) to red (max)', () => {
    expect(pendingHeatFactor(0, 0, 9)).toBe(0);
    expect(pendingHeatFactor(9, 0, 9)).toBe(1);
    expect(pendingHeatFactor(3, 0, 9)).toBeCloseTo(1 / 3);
    expect(pendingHeatFactor(4, 4, 4)).toBe(0);
  });

  it('resolves evaluation module and course href from leaf courseKey', () => {
    expect(findEvaluationModuleId('intern2', 'internship', CATALOG)).toBe(
      'course_internship'
    );
    expect(findEvaluationModuleId('appr1', 'apprenticeship', CATALOG)).toBe(
      'course_apprenticeship'
    );
    expect(
      dailyApprovalsCourseHref({
        kind: 'internship',
        moduleId: 'course_internship',
        courseKey: 'intern2',
      })
    ).toBe(
      '/karvita/daily-approvals?kind=internship&module=course_internship&course=intern2'
    );
  });
});
