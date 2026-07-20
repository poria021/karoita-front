import { describe, expect, it } from 'vitest';

import {
  buildTermTitle,
  defaultWeekCount,
  getCoursesForTermType,
  getTodayJalaliSlash,
  isTermGateActive,
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

  it('formats today as Jalali YYYY/MM/DD with English digits', () => {
    const today = getTodayJalaliSlash(new Date('2026-07-19T12:00:00Z'));
    expect(today).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    expect(today).not.toMatch(/\/01\/01$/);
  });

  it('derives gate activity from start date vs today', () => {
    expect(isTermGateActive(true, '1405/04/01', '1405/04/28')).toBe(true);
    expect(isTermGateActive(true, '1405/05/01', '1405/04/28')).toBe(false);
    expect(isTermGateActive(false, '1405/04/01', '1405/04/28')).toBe(false);
    expect(isTermGateActive(true, '', '1405/04/28')).toBe(false);
  });
});
