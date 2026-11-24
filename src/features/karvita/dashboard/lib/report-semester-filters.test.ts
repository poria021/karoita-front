import { describe, expect, it } from 'vitest';

import type { NestSemester } from '@/types/nest-admin';

import { currentSemesterReportFilters } from './report-semester-filters';

function semester(id: string, patch: Partial<NestSemester> = {}): NestSemester {
  return { id, season: 'one', structure: 'semester', ...patch };
}

describe('currentSemesterReportFilters', () => {
  it('برای هر مسیر ترم جاری را با structure همان مسیر می‌دهد', () => {
    const semesters = [
      semester('old', { startClasses: false, courseSelection: false }),
      semester('s-now', { startClasses: true }),
      semester('p-now', { structure: 'podmani', courseSelection: true }),
    ];
    expect(currentSemesterReportFilters(semesters, 'mentor_teacher')).toEqual([
      { semesterId: 's-now', structure: 'semester' },
      { semesterId: 'p-now', structure: 'podmani' },
    ]);
  });

  it('مسیرِ بدون ترم جاری فیلتر نمی‌گیرد (نه «همهٔ ترم‌ها»)', () => {
    const semesters = [
      semester('s-now', { startClasses: true }),
      semester('p-closed', {
        structure: 'podmani',
        startClasses: false,
        courseSelection: false,
      }),
    ];
    expect(currentSemesterReportFilters(semesters, 'school_principal')).toEqual([
      { semesterId: 's-now', structure: 'semester' },
    ]);
  });

  it('فهرست خالی یعنی هیچ فیلتری', () => {
    expect(currentSemesterReportFilters([], 'supervisor_professor')).toEqual([]);
  });
});
