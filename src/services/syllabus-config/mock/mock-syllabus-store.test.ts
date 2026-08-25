import { describe, expect, it } from 'vitest';

import {
  activateOfferingInSnapshot,
  buildTermTitle,
  defaultWeekCount,
  getCoursesForTermType,
  getTodayJalaliSlash,
  isTermGateActive,
  normalizeCourseTitle,
  offeringStorageKey,
  readWeeksFromSnapshot,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

describe('syllabus-config mock helpers', () => {
  it('normalizes course titles to English digits', () => {
    expect(normalizeCourseTitle('کارورزی ۱')).toBe('کارورزی 1');
  });

  it('builds stable legacy offering keys', () => {
    expect(offeringStorageKey('نیم‌سال اول 1405-1406', 'کارورزی ۱')).toBe(
      'C::نیم‌سال اول 1405-1406::کارورزی 1'
    );
  });

  it('returns catalog by term type with ids', () => {
    expect(getCoursesForTermType('semester')).toHaveLength(4);
    expect(getCoursesForTermType('modular')).toHaveLength(2);
    expect(getCoursesForTermType('semester')[0]?.id).toMatch(/^course_/);
    expect(defaultWeekCount('internship')).toBe(16);
    expect(defaultWeekCount('apprenticeship')).toBe(8);
  });

  it('builds term title with English academic year', () => {
    expect(
      buildTermTitle({
        type: 'semester',
        titlePrefix: 'نیم‌سال اول',
        academicYear: '۱۴۰۵-۱۴۰۶',
      })
    ).toBe('نیم‌سال اول 1405-1406');
  });

  it('evaluates term gates against jalali start date', () => {
    const today = getTodayJalaliSlash();
    expect(isTermGateActive(true, today, today)).toBe(true);
    expect(isTermGateActive(false, today, today)).toBe(false);
    expect(isTermGateActive(true, '1499/01/01', today)).toBe(false);
  });

  it('provides default weeks (16 for students/semester, 8 for skill learners/modular)', () => {
    const draft: SyllabusConfigSnapshot = {
      terms: [
        {
          id: 'term_2',
          title: 'نیم‌سال اول 1405-1406',
          type: 'semester',
          isEnrollOpen: false,
          isTermOpen: false,
          enrollStart: '',
          termStart: '',
        },
        {
          id: 'term_modular_1',
          title: 'دوره مهارتی 1405-1406',
          type: 'modular',
          isEnrollOpen: false,
          isTermOpen: false,
          enrollStart: '',
          termStart: '',
        },
      ],
      offerings: {},
      internships: [],
      globalProfessorCapacity: 15,
      passingScoreThreshold: 70,
    };

    const studentWeeks = readWeeksFromSnapshot(
      draft,
      'term_2',
      'course_internship_1'
    );
    expect(studentWeeks).toHaveLength(16);
    expect(studentWeeks[0]?.title).toBe('هفته 1');
    expect(studentWeeks[15]?.title).toBe('هفته 16');

    const skillLearnerWeeks = readWeeksFromSnapshot(
      draft,
      'term_modular_1',
      'course_apprenticeship_1'
    );
    expect(skillLearnerWeeks).toHaveLength(8);
    expect(skillLearnerWeeks[0]?.title).toBe('هفته 1');
    expect(skillLearnerWeeks[7]?.title).toBe('هفته 8');

    activateOfferingInSnapshot(
      draft,
      'term_2',
      'course_internship_1',
      'internship'
    );

    const activatedWeeks = readWeeksFromSnapshot(
      draft,
      'term_2',
      'course_internship_1'
    );
    expect(activatedWeeks).toHaveLength(16);
    expect(
      draft.offerings.off_term_2_course_internship_1?.isOffered
    ).toBe(true);
  });
});
