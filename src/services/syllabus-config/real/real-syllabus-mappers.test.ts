import { describe, expect, it } from 'vitest';

import type { NestSemester, NestSemesterWithLessons } from '@/types/nest-admin';
import type { AcademicTerm, SyllabusWeek } from '@/types/syllabus-config';

import {
  catalogKindForTermType,
  mergeTermsWithLessonBundles,
  nestEntityId,
  nestLessonTitle,
  normalizeAcademicYear,
  parseNestAcademicSettings,
  parseNestLessonWeekList,
  parseNestLessonWeeksGet,
  parseNestSemester,
  toAcademicSettings,
  toAcademicTerm,
  toAcademicTermType,
  toCourseCatalogItem,
  toCourseOfferingListItem,
  isNestObjectId,
  planNestWeekWrites,
  toNestLessonWeeksBody,
  toNestSemesterAllStructure,
  toNestSemesterDto,
  toNestSemesterStructure,
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
    expect(toNestSemesterStructure('modular')).toBe('podmani');
    expect(toNestSemesterAllStructure('modular')).toBe('podmani');
    expect(toNestSemesterAllStructure('semester')).toBe('semester');
    expect(catalogKindForTermType('modular')).toBe('apprenticeship');
  });

  it('builds term title from academicYear and reads gates on the semester', () => {
    const term = toAcademicTerm(LISTED_SEMESTER, {
      todayJalali: '1405/06/06',
    });
    expect(term.title).toBe('نیم‌سال اول 1405-1406');
    expect(term.titlePrefix).toBe('نیم‌سال اول');
    expect(term.academicYear).toBe('1405-1406');
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
      toNestSemesterDto({
        type: 'modular',
        titlePrefix: 'پودمان اول',
        academicYear: '۱۴۰۵ -۱۴۰7',
      })
    ).toEqual({
      season: 'one',
      structure: 'podmani',
      academicYear: '1405-1407',
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
    expect(
      toNestSemesterWriteDto(
        {
          id: '6a96bc5ec0dbacb9d068188b',
          season: 'one',
          structure: 'podmani',
          academicYear: '۱۴۰۵ -۱۴۰7',
          courseSelection: false,
          startClasses: false,
        },
        { startClasses: true }
      )
    ).toEqual({
      season: 'one',
      structure: 'podmani',
      academicYear: '۱۴۰۵ -۱۴۰7',
      courseSelection: false,
      startClasses: true,
    });
  });

  it('normalizes mixed academicYear spellings from live Nest', () => {
    expect(normalizeAcademicYear('۱۴۰۵ -۱۴۰7')).toBe('1405-1407');
    expect(normalizeAcademicYear('۱۴۰۵-۱۴۰۶')).toBe('1405-1406');
    expect(normalizeAcademicYear('1405-1407')).toBe('1405-1407');
    const term = toAcademicTerm(
      {
        id: '6a96bc5ec0dbacb9d068188b',
        season: 'one',
        structure: 'podmani',
        academicYears: '۱۴۰۵ -۱۴۰7',
        courseSelection: false,
        startClasses: false,
      },
      { todayJalali: '1405/06/10' }
    );
    expect(term.type).toBe('modular');
    expect(term.titlePrefix).toBe('پودمان اول');
    expect(term.academicYear).toBe('1405-1407');
    expect(term.title).toBe('پودمان اول 1405-1407');
  });

  it('unwraps a live mongoose PATCH document into NestSemester', () => {
    const parsed = parseNestSemester(
      {
        $__: { skipId: true },
        $isNew: false,
        _doc: {
          _id: {
            buffer: {
              '0': 106,
              '1': 150,
              '2': 188,
              '3': 94,
              '4': 192,
              '5': 219,
              '6': 172,
              '7': 185,
              '8': 208,
              '9': 104,
              '10': 24,
              '11': 139,
            },
          },
          season: 'one',
          structure: 'podmani',
          academicYear: '۱۴۰۵ -۱۴۰7',
          courseSelection: false,
          startClasses: false,
        },
      },
      'fallback'
    );
    expect(parsed).toMatchObject({
      id: '6a96bc5ec0dbacb9d068188b',
      season: 'one',
      structure: 'podmani',
      academicYear: '۱۴۰۵ -۱۴۰7',
      courseSelection: false,
      startClasses: false,
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

  it('maps Nest priority to local weight and PUT sends weight not week index', () => {
    const week = toSyllabusWeek(
      { priority: 2, status: false, title: 'جلسه دوم' },
      0,
      3
    );
    expect(week).toMatchObject({
      suffix: 'جلسه دوم',
      title: 'جلسه دوم',
      weight: 2,
      status: 'archived',
    });
    expect(toSyllabusWeek({ status: true }, 8, 3)).toMatchObject({
      suffix: 'هفته 9',
      title: 'هفته 9',
      weight: 3,
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
      { priority: 2, status: false },
      { priority: 3, status: true },
    ]);
  });

  it('POSTs all draft weeks when GET is still empty', () => {
    expect(isNestObjectId('6a9164b4c208454ddf32ec92')).toBe(true);
    expect(isNestObjectId('week_1')).toBe(false);

    const lessonId = '6a8e2b51d2187e0f2fdb784c';
    const plan = planNestWeekWrites(
      lessonId,
      [
        {
          id: 'week_local_1',
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
      []
    );

    expect(plan.creates).toEqual([
      {
        lessonId,
        priority: 3,
        status: true,
      },
      {
        lessonId,
        priority: 3,
        status: false,
      },
    ]);
    expect(plan.updates).toEqual([]);
    expect(plan.deletions).toEqual([]);
  });

  it('POSTs extra local weeks appended after GET already returned a published set', () => {
    const lessonId = '6a8e2b51d2187e0f2fdb784c';
    const plan = planNestWeekWrites(
      lessonId,
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
      [{ id: '6a9164b4c208454ddf32ec92', priority: 3, status: true }]
    );

    expect(plan.creates).toEqual([
      { lessonId, priority: 3, status: false },
    ]);
    expect(plan.updates).toEqual([]);
    expect(plan.deletions).toEqual([]);
  });

  it('reuses remote week by list index instead of POSTing a duplicate', () => {
    const plan = planNestWeekWrites(
      '6a8e2b51d2187e0f2fdb784c',
      [
        {
          id: 'week_priority_1',
          suffix: 'هفته 1',
          title: 'هفته 1',
          weight: 3,
          status: 'archived',
        },
      ],
      [{ id: '6a9164b4c208454ddf32ec92', priority: 1, status: true }]
    );
    expect(plan.creates).toEqual([]);
    expect(plan.updates).toEqual([
      {
        id: '6a9164b4c208454ddf32ec92',
        body: {
          lessonId: '6a8e2b51d2187e0f2fdb784c',
          priority: 3,
          status: false,
        },
      },
    ]);
    expect(plan.deletions).toEqual([]);
  });

  it('does not delete leftover remote weeks after the set is published', () => {
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
      ],
      [
        { id: '6a9164b4c208454ddf32ec92', priority: 3, status: true },
        { id: '6a9164b4c208454ddf32ec93', priority: 2, status: true },
      ]
    );
    expect(plan.creates).toEqual([]);
    expect(plan.updates).toEqual([]);
    expect(plan.deletions).toEqual([]);
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

  it('parses GET /admin/settings and maps to local academic settings', () => {
    expect(
      parseNestAcademicSettings({
        id: '6a96c10bc0dbacb9d06818a0',
        systemPassingScore: 60,
        generalProfessorCapacity: 30,
      })
    ).toEqual({
      id: '6a96c10bc0dbacb9d06818a0',
      systemPassingScore: 60,
      generalProfessorCapacity: 30,
    });
    expect(
      toAcademicSettings({
        id: '6a96c10bc0dbacb9d06818a0',
        systemPassingScore: 60,
        generalProfessorCapacity: 30,
      })
    ).toEqual({
      globalProfessorCapacity: 30,
      passingScoreThreshold: 60,
    });
    expect(
      parseNestAcademicSettings([
        { id: 'old', systemPassingScore: 10, generalProfessorCapacity: 5 },
        { id: 'latest', systemPassingScore: 60, generalProfessorCapacity: 30 },
      ])
    ).toMatchObject({
      id: 'latest',
      systemPassingScore: 60,
      generalProfessorCapacity: 30,
    });
  });

  it('parses GET /admin/weeks/lesson and sorts by priority', () => {
    const rows = parseNestLessonWeekList([
      {
        id: '6a96c14fc0dbacb9d06818a1',
        status: false,
        lessonId: '6a96bc5ec0dbacb9d068188b',
        priority: 2,
      },
      {
        id: '6a96c14fc0dbacb9d06818a2',
        status: true,
        lessonId: '6a96bc5ec0dbacb9d068188b',
        priority: 1,
      },
    ]);
    expect(rows.map((week) => week.priority)).toEqual([1, 2]);
    expect(
      parseNestLessonWeekList({
        data: [
          {
            id: '6a96c14fc0dbacb9d06818a2',
            status: true,
            lessonId: '6a96bc5ec0dbacb9d068188b',
            priority: 1,
          },
        ],
      }).map((week) => week.id)
    ).toEqual(['6a96c14fc0dbacb9d06818a2']);
    expect(toNestLessonWeeksBody([
      {
        id: 'week_local',
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
    ])).toEqual({
      weeks: [
        { priority: 3, status: true },
        { priority: 3, status: false },
      ],
    });
    expect(
      toNestLessonWeeksBody(
        Array.from({ length: 9 }, (_, index) => ({
          id: `week_local_${index + 1}`,
          suffix: `هفته ${index + 1}`,
          title: `هفته ${index + 1}`,
          weight: 3,
          status: 'active' as const,
        }))
      ).weeks.every((week) => week.priority === 3)
    ).toBe(true);
  });

  it('marks GET weeks as published and reads server errors from the envelope', () => {
    expect(parseNestLessonWeeksGet([])).toEqual({
      weeks: [],
      isPublished: false,
      serverAlert: null,
    });
    expect(
      parseNestLessonWeeksGet({
        data: [
          {
            id: '6a96c14fc0dbacb9d06818a2',
            status: true,
            lessonId: '6a96bc5ec0dbacb9d068188b',
            priority: 1,
          },
        ],
        error: 'سرفصل این درس قبلاً ثبت شده است.',
      }).serverAlert
    ).toBe('سرفصل این درس قبلاً ثبت شده است.');
  });
});
