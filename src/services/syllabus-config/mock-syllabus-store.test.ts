import { describe, expect, it } from 'vitest';

import {
  buildTermTitle,
  defaultWeekCount,
  getCoursesForTermType,
  normalizeCourseTitle,
  offeringStorageKey,
} from '@/services/syllabus-config/mock-syllabus-store';

describe('syllabus-config mock helpers', () => {
  it('normalizes course titles to English digits', () => {
    expect(normalizeCourseTitle('کارورزی ۱')).toBe('کارورزی 1');
  });

  it('builds stable offering keys', () => {
    expect(offeringStorageKey('نیم‌سال اول 1405-1406', 'کارورزی ۱')).toBe(
      'C::نیم‌سال اول 1405-1406::کارورزی 1'
    );
  });

  it('returns catalog by term type', () => {
    expect(getCoursesForTermType('semester')).toHaveLength(4);
    expect(getCoursesForTermType('modular')).toHaveLength(2);
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
});
