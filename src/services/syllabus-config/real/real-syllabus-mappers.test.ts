import { describe, expect, it } from 'vitest';

import type { NestSemester, NestSemesterWithLessons } from '@/types/nest-admin';
import type { AcademicTerm, SyllabusWeek } from '@/types/syllabus-config';

import {
  catalogKindForTermType,
  mergeTermsWithLessonBundles,
  nestEntityId,
  nestLessonTitle,
  toAcademicTerm,
  toAcademicTermType,
  toCourseCatalogItem,
  toCourseOfferingListItem,
  isNestObjectId,
  planNestWeekWrites,
  toNestLessonWeeksBody,
  toNestSemesterAllStructure,
  toNestSemesterDto,
  toNestSemesterWriteDto,
  toSyllabusWeek,
} from './real-syllabus-mappers';

/** شکل GET `/admin/semester` — گیت روی خود ترم. */
const LISTED_SEMESTER: NestSemester = {
  id: '6a8e2b51d2187e0f2fdb784b',
  academicYear: '۱۴۰۵-۱۴۰۶',
  season: 'one',
  structure: 'semester',
  courseSelection: false,
  startClasses: true,
};

/** شکل GET `/admin/semesters_all` — درس/هفته؛ گیت معمولاً نیست. */
const SAMPLE_SEMESTER: NestSemesterWithLessons = {
  id: '6a8e2b51d2187e0f2fdb784b',
  season: 'one',
  structure: 'semester',
  academicYears: '۱۴۰۵-۱۴۰۶',
  lessons: [
    {
      _id: '6a8e2b51d2187e0f2fdb784c',
      id: '6a8e2b51d2187e0f2fdb784c',
      title: 'کارورزی ۱',
      semesterId: '6a8e2b51d2187e0f2fdb784b',
      status: true,
      capacity: 30,
      days: [0],
      weeks: [{ id: 'w1', priority: 1, status: true }],
    },
  ],
};

describe('real-syllabus-mappers offerings', () => {
  it('maps podmani structure to modular and the reverse query value', () => {
    expect(toAcademicTermType('podmani')).toBe('modular');
    expect(toAcademicTermType('modular')).toBe('modular');
    expect(toAcademicTermType('semester')).toBe('semester');
    expect(toNestSemesterAllStructure('modular')).toBe('podmani');
    expect(toNestSemesterAllStructure('semester')).toBe('semester');
    expect(catalogKindForTermType('modular')).toBe('apprenticeship');
  });

  it('builds term title from academicYear and reads gates on the semester', () => {
    const term = toAcademicTerm(LISTED_SEMESTER, {
      todayJalali: '1405/06/06',
    });
    expect(term.title).toBe('نیم‌سال اول 1405-1406');
    expect(term.isEnrollOpen).toBe(false);
    expect(term.isTermOpen).toBe(true);
    expect(term.termStart).toBe('1405/06/06');
    expect(term.enrollStart).toBe('');
  });

  it('falls back to lesson gates when the semester omits them', () => {
    const term = toAcademicTerm(
      { ...SAMPLE_SEMESTER, courseSelection: undefined, startClasses: undefined },
      {
        lessons: [
          {
            ...SAMPLE_SEMESTER.lessons![0]!,
            courseSelection: true,
            startClasses: false,
          },
        ],
        todayJalali: '1405/06/06',
      }
    );
    expect(term.isEnrollOpen).toBe(true);
    expect(term.isTermOpen).toBe(false);
    expect(term.enrollStart).toBe('1405/06/06');
  });

  it('writes create/update bodies with gates on the semester', () => {
    expect(
      toNestSemesterDto({
        type: 'semester',
        titlePrefix: 'نیم‌سال اول',
        academicYear: '۱۴۰۵-۱۴۰۶',
      })
    ).toEqual({
      season: 'one',
      structure: 'semester',
      academicYear: '1405-1406',
      courseSelection: false,
      startClasses: false,
    });
    expect(
      toNestSemesterWriteDto(LISTED_SEMESTER, { courseSelection: true })
    ).toEqual({
      season: 'one',
      structure: 'semester',
      academicYear: '۱۴۰۵-۱۴۰۶',
      courseSelection: true,
      startClasses: true,
    });
  });

  it('uses lesson id as catalog/offering id and status as isOffered', () => {
    const lesson = SAMPLE_SEMESTER.lessons![0]!;
    const catalog = toCourseCatalogItem(lesson, 'semester');
    const offering = toCourseOfferingListItem(lesson, 'semester');
    expect(catalog).toEqual({
      id: '6a8e2b51d2187e0f2fdb784c',
      title: 'کارورزی ۱',
      type: 'internship',
    });
    expect(offering?.isOffered).toBe(true);
    expect(offering?.courseOfferingId).toBe(catalog?.id);
    expect(nestEntityId({ _id: 'only-underscore' })).toBe('only-underscore');
    expect(nestLessonTitle({ name: 'کارورزی ۲' })).toBe('کارورزی ۲');
    expect(nestLessonTitle({ title: { fa: 'کارورزی ۳' } })).toBe('کارورزی ۳');
  });

  it('maps weeks by priority and boolean status; PUT body drops local weight', () => {
    const week = toSyllabusWeek(
      { priority: 2, status: false, title: 'جلسه دوم' },
      0,
      3
    );
    expect(week).toMatchObject({
      suffix: 'جلسه دوم',
      title: 'جلسه دوم',
      weight: 3,
      status: 'archived',
    });
    const body = toNestLessonWeeksBody([
      week,
      {
        id: 'w-active',
        suffix: 'هفته 1',
        title: 'هفته 1',
        weight: 9,
        status: 'active',
      } satisfies SyllabusWeek,
    ]);
    expect(body.weeks).toEqual([
      { priority: 1, status: false },
      { priority: 2, status: true },
    ]);
  });

  it('plans POST for draft weeks and PATCH for Nest ids', () => {
    expect(isNestObjectId('6a9164b4c208454ddf32ec92')).toBe(true);
    expect(isNestObjectId('week_1')).toBe(false);

    const plan = planNestWeekWrites(
      '6a8e2b51d2187e0f2fdb784c',
      [
        {
          id: '6a9164b4c208454ddf32ec92',
          suffix: 'هفته 1',
          title: 'هفته 1',
          weight: 3,
          status: 'active',
        },
        {
          id: 'week_local_2',
          suffix: 'هفته 2',
          title: 'هفته 2',
          weight: 3,
          status: 'archived',
        },
      ],
      [
        { id: '6a9164b4c208454ddf32ec92', priority: 1, status: true },
        { id: '6a9164b4c208454ddf32ec93', priority: 2, status: true },
      ]
    );

    expect(plan.creates).toEqual([
      {
        lessonId: '6a8e2b51d2187e0f2fdb784c',
        priority: 2,
        status: false,
      },
    ]);
    expect(plan.updates).toEqual([
      {
        id: '6a9164b4c208454ddf32ec92',
        body: {
          lessonId: '6a8e2b51d2187e0f2fdb784c',
          priority: 1,
          status: true,
        },
      },
      {
        id: '6a9164b4c208454ddf32ec93',
        body: {
          lessonId: '6a8e2b51d2187e0f2fdb784c',
          priority: 2,
          status: false,
        },
      },
    ]);
  });

  it('keeps listed semester gates when semesters_all omits them', () => {
    const listed: AcademicTerm[] = [
      toAcademicTerm(LISTED_SEMESTER, { todayJalali: '1405/06/06' }),
    ];
    const { terms, offerings } = mergeTermsWithLessonBundles(
      listed,
      [SAMPLE_SEMESTER],
      '1405/06/06',
      3
    );
    expect(terms[0]?.isTermOpen).toBe(true);
    expect(terms[0]?.termStart).toBe('1405/06/06');
    expect(offerings['6a8e2b51d2187e0f2fdb784c']?.isOffered).toBe(true);
    expect(offerings['6a8e2b51d2187e0f2fdb784c']?.title).toBe('کارورزی ۱');
    expect(offerings['6a8e2b51d2187e0f2fdb784c']?.weeks).toHaveLength(1);
  });
});
