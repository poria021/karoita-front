import { describe, expect, it } from 'vitest';

import type {
  InternshipEnrollmentPageState,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';

import {
  buildLearnerNextAction,
  buildLearnerWorkbenchModels,
  pickFocusSnapshot,
  urgencyScore,
  type LearnerLevelSnapshot,
} from './learner-workbench';

function week(
  patch: Partial<InternshipWeeklySession> & Pick<InternshipWeeklySession, 'id'>
): InternshipWeeklySession {
  return {
    title: patch.title ?? `هفته ${patch.id}`,
    status: patch.status ?? 'draft',
    score: patch.score ?? null,
    ...patch,
  };
}

function state(
  patch: Partial<InternshipEnrollmentPageState> &
    Pick<InternshipEnrollmentPageState, 'scenario' | 'level'>
): InternshipEnrollmentPageState {
  return {
    kind: patch.kind ?? 'internship',
    courseName: patch.courseName ?? 'کارورزی',
    termTitle: patch.termTitle ?? 'نیم‌سال ۱۴۰۴',
    termId: patch.termId ?? 'term-1',
    lessonId: patch.lessonId ?? 'course_internship_1',
    enrollment: patch.enrollment ?? null,
    termHistory: patch.termHistory ?? [],
    selection: patch.selection ?? null,
    conflictEnrollment: patch.conflictEnrollment ?? null,
    ...patch,
  };
}

function snap(
  level: number,
  scenario: InternshipEnrollmentPageState['scenario'],
  enrollment?: InternshipEnrollmentPageState['enrollment']
): LearnerLevelSnapshot {
  return {
    level,
    state: state({
      level,
      scenario,
      enrollment: enrollment ?? null,
      courseTitle: `کارورزی ${level}`,
    }),
  };
}

describe('learner-workbench helpers', () => {
  it('ranks S5 needs_edit ahead of open enrollment', () => {
    const active = snap(2, 'S5_term_active', {
      enrollmentId: 'e1',
      supervisorName: 'استاد',
      attendanceDaysLabel: '',
      schoolId: null,
      schoolName: null,
      mentorId: null,
      mentorName: null,
      courseTitle: 'کارورزی ۲',
      termTitle: 'نیم‌سال',
      status: 'active',
      removalPending: false,
      isTermArchived: false,
      weeks: [week({ id: 'w1', status: 'needs_edit' })],
      progressiveGrade: { gradedCount: 0, final20: null },
      weeksAreReal: true,
    });
    const open = snap(1, 'S3_enroll_open');
    expect(urgencyScore(active)).toBeGreaterThan(urgencyScore(open));
    expect(pickFocusSnapshot([open, active])?.level).toBe(2);
  });

  it('builds enroll CTA for S3', () => {
    const action = buildLearnerNextAction(snap(1, 'S3_enroll_open'));
    expect(action.tone).toBe('action');
    expect(action.ctaLabel).toBe('شروع انتخاب واحد');
    expect(action.href).toContain('/karvita/internships/1');
  });

  it('builds revise CTA for needs_edit week', () => {
    const action = buildLearnerNextAction(
      snap(1, 'S5_term_active', {
        enrollmentId: 'e1',
        supervisorName: null,
        attendanceDaysLabel: '',
        schoolId: null,
        schoolName: null,
        mentorId: null,
        mentorName: null,
        courseTitle: 'کارورزی ۱',
        termTitle: 'نیم‌سال',
        status: 'active',
        removalPending: false,
        isTermArchived: false,
        weeks: [
          week({ id: 'w1', status: 'graded', score: 80 }),
          week({ id: 'w2', status: 'needs_edit' }),
        ],
        progressiveGrade: { gradedCount: 1, final20: 16 },
        weeksAreReal: true,
      })
    );
    expect(action.title).toContain('هفته ۲');
    expect(action.ctaLabel).toBe('اصلاح گزارش');
  });

  it('exposes active course week stats for enrolled S5', () => {
    const models = buildLearnerWorkbenchModels([
      snap(1, 'S5_term_active', {
        enrollmentId: 'e1',
        supervisorName: 'استاد الف',
        attendanceDaysLabel: '',
        schoolId: 's1',
        schoolName: 'مدرسه نمونه',
        mentorId: null,
        mentorName: null,
        courseTitle: 'کارورزی ۱',
        termTitle: 'نیم‌سال',
        status: 'active',
        removalPending: false,
        isTermArchived: false,
        weeks: [
          week({ id: 'w1', status: 'graded' }),
          week({ id: 'w2', status: 'draft' }),
          week({ id: 'w3', status: 'overdue' }),
        ],
        progressiveGrade: { gradedCount: 1, final20: 15 },
        weeksAreReal: true,
      }),
    ]);
    expect(models.activeCourse?.enrolled).toBe(true);
    expect(models.activeCourse?.weekStats?.overdue).toBe(1);
    expect(models.activeCourse?.weekStats?.actionableWeekNumber).toBe(2);
    expect(models.nextAction?.tone).toBe('action');
  });
});
