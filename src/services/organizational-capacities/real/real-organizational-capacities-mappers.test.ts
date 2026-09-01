import { describe, expect, it } from 'vitest';

import {
  filterBundlesForCapacityKind,
  lessonKindFromTitle,
  lessonLevelFromTitle,
  nestDaysToSelectedDays,
  nestStructureForCapacityKind,
  parseGeneralProfessorCapacity,
  parseNestProfessorCapacity,
  parseNestSemesterBundle,
  selectedDaysToNestDays,
  termTitleFromBundle,
  toCapacityCourseFromLesson,
  toWriteDto,
} from './real-organizational-capacities-mappers';

describe('real organizational capacity mappers', () => {
  it('splits mixed podmani payload by lesson title', () => {
    expect(nestStructureForCapacityKind('internship')).toBe('semester');
    expect(nestStructureForCapacityKind('apprenticeship')).toBe('podmani');
    expect(lessonKindFromTitle('کارورزی ۱')).toBe('internship');
    expect(lessonKindFromTitle('کارآموزی ۲')).toBe('apprenticeship');
    const mixed = [
      parseNestSemesterBundle({
        id: 'a',
        season: 'one',
        structure: 'podmani',
        academicYears: '1405-1406',
        lessons: [
          { id: '1', title: 'کارآموزی ۱' },
          { id: '2', title: 'کارآموزی ۲' },
        ],
      }),
      parseNestSemesterBundle({
        id: 'b',
        season: 'one',
        structure: 'podmani',
        academicYears: '1405-1402',
        lessons: [
          { id: '3', title: 'کارورزی ۱' },
          { id: '4', title: 'کارورزی ۲' },
        ],
      }),
    ].filter((row) => row !== null);
    expect(filterBundlesForCapacityKind(mixed, 'internship')).toEqual([
      expect.objectContaining({
        id: 'b',
        lessons: [
          expect.objectContaining({ title: 'کارورزی ۱' }),
          expect.objectContaining({ title: 'کارورزی ۲' }),
        ],
      }),
    ]);
    expect(filterBundlesForCapacityKind(mixed, 'apprenticeship')[0]?.id).toBe(
      'a'
    );
  });

  it('maps nest day 0–5 to a single weekday', () => {
    expect(nestDaysToSelectedDays([0, 1])).toEqual(['sat']);
    expect(nestDaysToSelectedDays([5])).toEqual(['thu']);
    expect(nestDaysToSelectedDays([])).toEqual([]);
    expect(selectedDaysToNestDays(['tue'])).toEqual([3]);
  });

  it('parses lesson level from persian title', () => {
    expect(lessonLevelFromTitle('کارورزی ۲')).toBe(2);
    expect(lessonLevelFromTitle('درس')).toBe(1);
  });

  it('parses semesters_all bundle and professor-capacity row', () => {
    const bundle = parseNestSemesterBundle({
      id: '6a96bc5ec0dbacb9d068188b',
      season: 'one',
      structure: 'podmani',
      academicYears: '۱۴۰۵ -۱۴۰7',
      lessons: [
        {
          id: '6a96bc5ec0dbacb9d068188c',
          title: 'کارورزی ۱',
          capacity: 30,
          days: [0],
        },
      ],
    });
    expect(bundle?.id).toBe('6a96bc5ec0dbacb9d068188b');
    expect(bundle?.lessons).toHaveLength(1);
    expect(termTitleFromBundle(bundle!)).toContain('پودمان اول');

    const row = parseNestProfessorCapacity({
      professorId: 'prof-1',
      lessonId: '6a96bc5ec0dbacb9d068188c',
      semesterId: '6a96bc5ec0dbacb9d068188b',
      days: [1],
      capacity: 14,
    });
    expect(row?.capacity).toBe(14);
  });

  it('builds a new course when GET is empty and a write dto from draft', () => {
    const course = toCapacityCourseFromLesson({
      lesson: {
        id: 'lesson-1',
        title: 'کارورزی ۱',
        capacity: 30,
        days: [0],
      },
      kind: 'internship',
      maxCapacity: 15,
      row: null,
    });
    expect(course.existsOnServer).toBe(false);
    expect(course.total).toBe(15);
    expect(course.selectedDays).toEqual(['sat']);

    const dto = toWriteDto({
      professorId: 'prof-1',
      semesterId: 'sem-1',
      course: { ...course, total: 12, selectedDays: ['mon'] },
      maxCapacity: 15,
    });
    expect(dto).toEqual({
      professorId: 'prof-1',
      lessonId: 'lesson-1',
      semesterId: 'sem-1',
      days: [2],
      capacity: 12,
    });
  });

  it('clamps existing capacity to generalProfessorCapacity', () => {
    const course = toCapacityCourseFromLesson({
      lesson: { id: 'lesson-1', title: 'کارورزی ۱', capacity: 30 },
      kind: 'internship',
      maxCapacity: 15,
      row: {
        professorId: 'prof-1',
        lessonId: 'lesson-1',
        semesterId: 'sem-1',
        days: [0],
        capacity: 40,
      },
    });
    expect(course.existsOnServer).toBe(true);
    expect(course.total).toBe(15);
    expect(parseGeneralProfessorCapacity({ generalProfessorCapacity: 20 })).toBe(
      20
    );
  });
});
