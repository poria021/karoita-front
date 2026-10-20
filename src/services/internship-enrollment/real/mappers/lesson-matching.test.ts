import { describe, expect, it } from 'vitest';

import type { NestSemesterEnrolmentsByTerm } from '@/types/nest-student-enrollments';

import {
  enrolledLevelsFromSemesters,
  findLessonForLeaf,
  findLessonForLevel,
  lessonMatchesLevel,
  openLevelsFromLessons,
  strictLessonLevelFromTitle,
} from './lesson-matching';

describe('strictLessonLevelFromTitle', () => {
  it('reads the standalone level number, Persian or Latin', () => {
    expect(strictLessonLevelFromTitle('کارورزی ۲')).toBe(2);
    expect(strictLessonLevelFromTitle('Internship 3')).toBe(3);
  });

  it('ignores year digits instead of reading 1 out of 1404', () => {
    expect(strictLessonLevelFromTitle('کارورزی ۱۴۰۴')).toBeNull();
    expect(strictLessonLevelFromTitle('کارورزی ۲ (۱۴۰۴-۱۴۰۵)')).toBe(2);
  });

  it('returns null for a title without a level, not level 1', () => {
    expect(strictLessonLevelFromTitle('کارورزی')).toBeNull();
  });
});

describe('lessonMatchesLevel', () => {
  it('requires both the kind and the level to match', () => {
    expect(lessonMatchesLevel({ title: 'کارورزی ۲' }, 'internship', 2)).toBe(true);
    expect(lessonMatchesLevel({ title: 'کارآموزی ۲' }, 'internship', 2)).toBe(false);
    expect(lessonMatchesLevel({ title: 'کارورزی' }, 'internship', 1)).toBe(false);
  });

  it('does not pick a levelless lesson for level 1', () => {
    const lessons = [{ title: 'کارورزی' }, { title: 'کارورزی ۱' }];
    expect(findLessonForLevel(lessons, 'internship', 1)).toBe(lessons[1]);
  });
});

const PROJECT_A = { level: 101, title: 'پروژه الف' };

describe('findLessonForLeaf', () => {
  it('prefers the level match and falls back to the exact title for levelless courses', () => {
    const lessons = [{ title: 'پروژه الف' }, { title: 'کارورزی ۱' }];
    expect(
      findLessonForLeaf(lessons, 'internship', { level: 1, title: 'کارورزی ۱' })
    ).toBe(lessons[1]);
    expect(findLessonForLeaf(lessons, 'internship', PROJECT_A)).toBe(lessons[0]);
    expect(
      findLessonForLeaf(lessons, 'internship', { level: 102, title: 'پروژه ب' })
    ).toBeNull();
  });
});

describe('openLevelsFromLessons', () => {
  it('lists only the leaves whose lesson is open (status true) right now', () => {
    const lessons = [
      { title: 'کارورزی ۱', status: true },
      { title: 'کارورزی ۲', status: false },
      { title: 'پروژه الف', status: true },
    ];
    const levels = openLevelsFromLessons(lessons, 'internship', [
      { level: 1, title: 'کارورزی ۱' },
      { level: 2, title: 'کارورزی ۲' },
      PROJECT_A,
      { level: 102, title: 'پروژه ب' },
    ]);
    expect([...levels].sort((a, b) => a - b)).toEqual([1, 101]);
  });
});

function semester(
  lessons: NestSemesterEnrolmentsByTerm['lessons']
): NestSemesterEnrolmentsByTerm {
  return { id: 'sem', season: 'one', structure: 'semester', lessons };
}

describe('enrolledLevelsFromSemesters', () => {
  it('counts any past enrolment (passed, failed or cancelled) by level or by title', () => {
    const levels = enrolledLevelsFromSemesters(
      [
        semester([
          { id: 'l2', title: 'کارورزی ۲', enrolment: { status: 'cancelled' } },
          {
            id: 'lp',
            title: 'پروژه الف',
            enrolment: { status: 'completed', isPass: false },
          },
          { id: 'l3', title: 'کارورزی ۳', enrolment: null },
        ]),
      ],
      'internship',
      [
        { level: 2, title: 'کارورزی ۲' },
        { level: 3, title: 'کارورزی ۳' },
        PROJECT_A,
      ]
    );
    expect([...levels].sort((a, b) => a - b)).toEqual([2, 101]);
  });
});
