import { describe, expect, it } from 'vitest';

import type {
  InternshipEnrollmentPageState,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';

import {
  buildLearnerCourseWeekRows,
  buildLearnerGradeChartRows,
  buildLearnerGradeSeries,
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

  describe('buildLearnerCourseWeekRows', () => {
    const baseEnrollment = {
      enrollmentId: 'e1',
      supervisorName: null,
      attendanceDaysLabel: '',
      schoolId: null,
      schoolName: null,
      mentorId: null,
      mentorName: null,
      courseTitle: 'درس',
      termTitle: 'نیم‌سال',
      status: 'active' as const,
      removalPending: false,
      isTermArchived: false,
      weeks: [] as InternshipWeeklySession[],
      progressiveGrade: { gradedCount: 0, final20: null },
      weeksAreReal: true,
    };

    it('builds one row per taken course with week cells and final grade', () => {
      const rows = buildLearnerCourseWeekRows([
        snap(1, 'S5_term_active', {
          ...baseEnrollment,
          weeks: [
            week({ id: 'w1', status: 'graded', score: 88, title: 'هفته اول' }),
            week({ id: 'w2', status: 'pending', score: 70 }),
            week({ id: 'w3', status: 'locked_future' }),
          ],
          progressiveGrade: { gradedCount: 1, final20: 17.6 },
        }),
      ]);

      expect(rows).toHaveLength(1);
      expect(rows[0]?.id).toBe('internship-1');
      expect(rows[0]?.courseTitle).toBe('کارورزی 1');
      expect(rows[0]?.href).toContain('/karvita/internships/1');
      expect(rows[0]?.finalGrade).toBe(17.6);
      expect(rows[0]?.weeks.map((cell) => cell.status)).toEqual([
        'graded',
        'pending',
        'locked_future',
      ]);
      expect(rows[0]?.weeks.map((cell) => cell.weekNumber)).toEqual([1, 2, 3]);
      expect(rows[0]?.weeks[0]?.title).toBe('هفته اول');
      // فقط هفتهٔ graded نمره می‌گیرد؛ نمرهٔ هفتهٔ pending نباید نشان داده شود.
      expect(rows[0]?.weeks.map((cell) => cell.score)).toEqual([88, null, null]);
    });

    it('includes courses from previous terms, sorted by level', () => {
      const rows = buildLearnerCourseWeekRows([
        snap(3, 'S5_term_active', { ...baseEnrollment, enrollmentId: 'e3' }),
        {
          level: 1,
          state: state({
            level: 1,
            scenario: 'S5_term_active',
            termId: 'term-old',
            openTermId: 'term-1',
            courseTitle: 'کارورزی ۱',
            enrollment: {
              ...baseEnrollment,
              enrollmentId: 'e1',
              status: 'completed',
              progressiveGrade: { gradedCount: 16, final20: 14 },
            },
          }),
        },
        snap(2, 'S4_registered_waiting', { ...baseEnrollment, enrollmentId: 'e2' }),
      ]);

      expect(rows.map((row) => row.id)).toEqual([
        'internship-1',
        'internship-2',
        'internship-3',
      ]);
      expect(rows[0]?.finalGrade).toBe(14);
    });

    it('skips dropped enrollments and levels without enrollment', () => {
      const rows = buildLearnerCourseWeekRows([
        snap(1, 'S5_term_active', { ...baseEnrollment, status: 'dropped' }),
        snap(2, 'S3_enroll_open'),
        snap(3, 'S5_term_active', { ...baseEnrollment, enrollmentId: 'e3' }),
      ]);

      expect(rows.map((row) => row.id)).toEqual(['internship-3']);
    });

    it('keeps finalGrade null until a grade exists and falls back to week title', () => {
      const rows = buildLearnerCourseWeekRows([
        snap(1, 'S5_term_active', {
          ...baseEnrollment,
          weeks: [{ ...week({ id: 'w1', status: 'draft' }), title: '  ' }],
        }),
      ]);

      expect(rows[0]?.finalGrade).toBeNull();
      expect(rows[0]?.weeks[0]?.title).toBe('هفته ۱');
    });

    it('returns an empty list when nothing is enrolled', () => {
      expect(buildLearnerCourseWeekRows([])).toEqual([]);
      expect(buildLearnerCourseWeekRows([snap(1, 'S3_enroll_open')])).toEqual([]);
    });
  });
});
