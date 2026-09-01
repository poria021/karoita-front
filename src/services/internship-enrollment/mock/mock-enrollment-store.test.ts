import { describe, expect, it } from 'vitest';

import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
  saveWeeklyReportDraft,
} from '@/services/internship-enrollment/mock/mock-enrollment-store';

describe('internship-enrollment mock helpers', () => {
  it('maps role to course kind and clamps level', () => {
    expect(kindForRole('student')).toBe('internship');
    expect(kindForRole('skill_learner')).toBe('apprenticeship');
    expect(courseNameForKind('internship')).toBe('کارورزی');
    expect(courseNameForKind('apprenticeship')).toBe('کارآموزی');
    expect(maxLevelForKind('internship')).toBe(4);
    expect(maxLevelForKind('apprenticeship')).toBe(2);
    expect(clampLevel('apprenticeship', 4)).toBe(2);
  });

  it('rejects empty weekly report payloads', () => {
    expect(() =>
      saveWeeklyReportDraft({
        actor: {
          id: 'student-empty',
          role: 'student',
          approved: true,
          province: ['تهران'],
          college: ['پردیس شهید باهنر تهران'],
          district: ['ناحیه ۱ تهران'],
        },
        kind: 'internship',
        level: 1,
        termId: 'term_sem',
        weekId: 'week-1',
        text: '   ',
        files: [],
      })
    ).toThrow(/گزارش خالی/);
  });

  it('resolves Phase 1 gate empty scenarios', () => {
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: false,
        enrollOpen: false,
        termOpen: false,
        registered: false,
      })
    ).toBe('S1_syllabus_blocked');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: true,
        registered: false,
      })
    ).toBe('S2_enroll_closed');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: true,
        termOpen: false,
        registered: false,
      })
    ).toBe('S3_enroll_open');

    // ترم باز هم انتخاب واحد را نمی‌بندد — فقط بعد از ثبت‌نام به `S5` می‌رود.
    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: true,
        termOpen: true,
        registered: false,
      })
    ).toBe('S3_enroll_open');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: false,
        registered: true,
      })
    ).toBe('S4_registered_waiting');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: true,
        registered: true,
      })
    ).toBe('S5_term_active');

    expect(
      resolveEnrollmentScenario({
        syllabusConfigured: true,
        enrollOpen: false,
        termOpen: false,
        registered: true,
        status: 'dropped',
      })
    ).toBe('S5_term_active');
  });
});
