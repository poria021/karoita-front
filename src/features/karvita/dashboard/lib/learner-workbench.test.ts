import { describe, expect, it } from 'vitest';

import type {
  InternshipEnrollmentPageState,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';

import {
  buildLearnerCourseWeekHighlights,
  buildLearnerGradeChartRows,
  buildLearnerGradeSeries,
  buildLearnerNextAction,
  buildLearnerWorkbenchModels,
  pickFocusSnapshot,
  pickLearnerFeaturedWeek,
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
    openTermId: patch.openTermId ?? 'term-1',
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
    expect(models.openTermCourses).toHaveLength(1);
    expect(models.nextAction?.tone).toBe('action');
  });

  it('builds one card per course enrolled in the open term', () => {
    const enrollment = {
      enrollmentId: 'e1',
      supervisorName: 'استاد',
      attendanceDaysLabel: '',
      schoolId: null,
      schoolName: null,
      mentorId: null,
      mentorName: null,
      courseTitle: 'درس',
      termTitle: 'نیم‌سال باز',
      status: 'active' as const,
      removalPending: false,
      isTermArchived: false,
      weeks: [week({ id: 'w1', status: 'draft' as const })],
      progressiveGrade: { gradedCount: 0, final20: null },
      weeksAreReal: true,
    };
    const models = buildLearnerWorkbenchModels([
      snap(2, 'S5_term_active', { ...enrollment, enrollmentId: 'e2', courseTitle: 'کارورزی ۲' }),
      snap(1, 'S4_registered_waiting', {
        ...enrollment,
        courseTitle: 'کارورزی ۱',
        weeks: [],
      }),
      snap(3, 'S5_term_active', {
        ...enrollment,
        enrollmentId: 'e3',
        courseTitle: 'کارورزی ۳',
      }),
      {
        level: 4,
        state: state({
          level: 4,
          scenario: 'S5_term_active',
          termId: 'term-old',
          openTermId: 'term-1',
          courseTitle: 'کارورزی ۴',
          enrollment: {
            ...enrollment,
            enrollmentId: 'e4',
            courseTitle: 'کارورزی ۴',
            termTitle: 'نیم‌سال قبل',
          },
        }),
      },
      snap(5, 'S3_enroll_open'),
    ]);

    expect(models.openTermCourses.map((course) => course.level)).toEqual([1, 2, 3]);
    expect(models.openTermCourses.every((course) => course.enrolled)).toBe(true);
  });

  it('builds weekly grade series and chart rows for open-term courses', () => {
    const series = buildLearnerGradeSeries([
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
          week({ id: 'w1', status: 'graded', score: 88, title: 'هفته اول' }),
          week({ id: 'w2', status: 'pending' }),
          week({ id: 'w3', status: 'graded', score: 76, title: 'هفته سوم' }),
        ],
        progressiveGrade: { gradedCount: 2, final20: 16.4 },
        weeksAreReal: true,
      }),
      snap(2, 'S5_term_active', {
        enrollmentId: 'e2',
        supervisorName: null,
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
        weeks: [week({ id: 'w1', status: 'graded', score: 91 })],
        progressiveGrade: { gradedCount: 1, final20: 18.2 },
        weeksAreReal: true,
      }),
    ]);

    expect(series).toHaveLength(2);
    expect(series[0]?.id).toBe('internship-1');
    expect(series[0]?.weeks.map((point) => point.score)).toEqual([88, null, 76]);
    expect(series[1]?.weeks.map((point) => point.score)).toEqual([91]);

    const rows = buildLearnerGradeChartRows(series);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.['internship-1']).toBe(88);
    expect(rows[0]?.['internship-2']).toBe(91);
    expect(rows[1]?.['internship-1']).toBeNull();
    expect(rows[2]?.['internship-1']).toBe(76);
    expect(rows[2]?.['internship-2']).toBeNull();
  });

  it('prefers latest week when it has teacher reaction', () => {
    const featured = pickLearnerFeaturedWeek([
      week({ id: 'w1', status: 'graded', score: 80 }),
      week({
        id: 'w2',
        status: 'needs_edit',
        feedback: { advisor: 'لطفاً اصلاح کنید', advisorAt: '2026-01-01T10:00:00Z' },
      }),
      week({ id: 'w3', status: 'locked_future' }),
    ]);
    expect(featured?.week.id).toBe('w2');
    expect(featured?.weekNumber).toBe(2);
    expect(featured?.hasTeacherReaction).toBe(true);
  });

  it('falls back to latest unlocked week without reaction', () => {
    const featured = pickLearnerFeaturedWeek([
      week({ id: 'w1', status: 'draft' }),
      week({ id: 'w2', status: 'pending' }),
      week({ id: 'w3', status: 'locked_future' }),
    ]);
    expect(featured?.week.id).toBe('w2');
    expect(featured?.hasTeacherReaction).toBe(false);
  });

  it('builds course week highlight cards with advisor feedback', () => {
    const highlights = buildLearnerCourseWeekHighlights([
      snap(1, 'S5_term_active', {
        enrollmentId: 'e1',
        supervisorName: 'دکتر احمدی',
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
          week({ id: 'w1', status: 'graded', score: 88 }),
          week({
            id: 'w2',
            status: 'needs_edit',
            title: 'هفته دوم',
            feedback: {
              advisor: 'مشاهده مشارکتی را کامل کنید.',
              advisorAt: '2026-02-01T12:00:00Z',
            },
          }),
        ],
        progressiveGrade: { gradedCount: 1, final20: 17.6 },
        weeksAreReal: true,
      }),
    ]);

    expect(highlights).toHaveLength(1);
    expect(highlights[0]?.id).toBe('internship-1');
    expect(highlights[0]?.weekNumber).toBe(2);
    expect(highlights[0]?.hasTeacherReaction).toBe(true);
    expect(highlights[0]?.reactionRole).toBe('advisor');
    expect(highlights[0]?.reactionText).toContain('مشاهده مشارکتی');
    expect(highlights[0]?.supervisorName).toBe('دکتر احمدی');
  });
});
