import { describe, expect, it } from 'vitest';

import {
  filterSupervisorsClientSide,
  findLessonForLevel,
  mapEnrollmentProfessor,
  parseOpenCourseSelection,
  toEnrollmentPageState,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';
import type { NestSemesterEnrolmentsByTerm } from '@/types/nest-student-enrollments';

const student: InternshipEnrollmentActor = {
  id: 'u1',
  role: 'student',
  approved: true,
  province: ['تهران'],
  college: ['پردیس شهید باهنر تهران'],
};

const OPEN = {
  id: '6a9a4c2dd62f2b45691e5616',
  academicYear: '۱۴۰۵-۱۴۰۶',
  season: 'one' as const,
  structure: 'semester' as const,
  courseSelection: true,
  startClasses: false,
  lessons: [
    {
      id: '6a9a4c2dd62f2b45691e5617',
      semesterId: '6a9a4c2dd62f2b45691e5616',
      title: 'کارورزی ۱',
      status: false,
    },
    {
      id: '6a9a4c2dd62f2b45691e5618',
      semesterId: '6a9a4c2dd62f2b45691e5616',
      title: 'کارورزی ۲',
      status: false,
    },
  ],
};

/** نمونهٔ `by-semester` منطبق با `OPEN` — بدون `enrolment` روی هیچ درسی. */
const SEMESTERS_EMPTY: NestSemesterEnrolmentsByTerm[] = [
  {
    id: OPEN.id,
    season: OPEN.season,
    structure: OPEN.structure,
    academicYears: OPEN.academicYear,
    courseSelection: OPEN.courseSelection,
    startClasses: OPEN.startClasses,
    lessons: OPEN.lessons.map((lesson) => ({ ...lesson, enrolment: null })),
  },
];

describe('real enrollment mappers', () => {
  it('parses open-course-selection and maps S3 when the lesson exists', () => {
    const parsed = parseOpenCourseSelection(OPEN);
    expect(parsed?.id).toBe('6a9a4c2dd62f2b45691e5616');
    expect(findLessonForLevel(parsed!.lessons ?? [], 'internship', 1)?.id).toBe(
      '6a9a4c2dd62f2b45691e5617'
    );

    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      parsed,
      SEMESTERS_EMPTY
    );
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.termId).toBe('6a9a4c2dd62f2b45691e5616');
    expect(state.lessonId).toBe('6a9a4c2dd62f2b45691e5617');
    expect(state.termTitle).toContain('نیم‌سال اول');
    expect(state.selection?.scope.province).toBe('تهران');
  });

  it('maps S1 when the current level is missing from the open term', () => {
    const parsed = parseOpenCourseSelection(OPEN);
    const state = toEnrollmentPageState(
      { actor: student, level: 4 },
      parsed,
      SEMESTERS_EMPTY
    );
    expect(state.scenario).toBe('S1_syllabus_blocked');
    expect(state.lessonId).toBeNull();
  });

  it('blocks selection when canSelect is explicitly false on the open lesson', () => {
    const parsed = parseOpenCourseSelection({
      ...OPEN,
      lessons: [
        { ...OPEN.lessons[0], canSelect: false, blockReason: 'in_progress' },
        OPEN.lessons[1],
      ],
    });
    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      parsed,
      SEMESTERS_EMPTY
    );
    expect(state.scenario).toBe('S2_enroll_closed');
  });

  it('maps S3 when the offered lesson has status true but the student has no enrollment', () => {
    const parsed = parseOpenCourseSelection({
      ...OPEN,
      lessons: [{ ...OPEN.lessons[0], status: true }, OPEN.lessons[1]],
    });
    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      parsed,
      SEMESTERS_EMPTY
    );
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.enrollment).toBeNull();
  });

  it('maps S6 when the student has another lesson of the same kind in the open semester', () => {
    const parsed = parseOpenCourseSelection(OPEN);
    const semesters: NestSemesterEnrolmentsByTerm[] = [
      {
        ...SEMESTERS_EMPTY[0],
        lessons: [
          SEMESTERS_EMPTY[0].lessons[0],
          {
            ...SEMESTERS_EMPTY[0].lessons[1],
            enrolment: {
              id: 'enr-2',
              lessonId: OPEN.lessons[1].id,
              semesterId: OPEN.id,
              professorId: 'p1',
              status: 'active',
            },
          },
        ],
      },
    ];
    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      parsed,
      semesters
    );
    expect(state.scenario).toBe('S6_already_enrolled_elsewhere');
    expect(state.conflictEnrollment).toEqual({
      level: 2,
      courseTitle: 'کارورزی ۲',
    });
  });

  it('maps S4 with a summary when the student has an active enrolment in this lesson', () => {
    const parsed = parseOpenCourseSelection({
      ...OPEN,
      lessons: [{ ...OPEN.lessons[0], status: true }, OPEN.lessons[1]],
    });
    const semesters: NestSemesterEnrolmentsByTerm[] = [
      {
        ...SEMESTERS_EMPTY[0],
        lessons: [
          {
            ...SEMESTERS_EMPTY[0].lessons[0],
            status: true,
            enrolment: {
              id: 'enr-1',
              lessonId: OPEN.lessons[0].id,
              semesterId: OPEN.id,
              professorId: 'p1',
              status: 'active',
            },
          },
          SEMESTERS_EMPTY[0].lessons[1],
        ],
      },
    ];
    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      parsed,
      semesters,
      { supervisorName: 'سارا احمدی' }
    );
    expect(state.scenario).toBe('S4_registered_waiting');
    expect(state.enrollment?.courseTitle).toBe('کارورزی 1');
    expect(state.enrollment?.supervisorName).toBe('سارا احمدی');
    // `student-weeks` هنوز به فرانت وصل نشده؛ بدون `realWeeklyData` خالی می‌ماند
    // (رجوع به enrollment-summary.ts) — دیگر با mock پر نمی‌شود.
    expect(state.enrollment?.weeks).toEqual([]);
  });

  it('shows the report page for a past, closed term where the student is still active', () => {
    const closedSemester: NestSemesterEnrolmentsByTerm = {
      id: 'closed-term-1',
      season: 'two',
      structure: 'semester',
      academicYears: '۱۴۰۴-۱۴۰۵',
      courseSelection: false,
      startClasses: true,
      lessons: [
        {
          id: 'closed-lesson-1',
          semesterId: 'closed-term-1',
          title: 'کارورزی ۱',
          status: true,
          enrolment: {
            id: 'enr-old',
            lessonId: 'closed-lesson-1',
            semesterId: 'closed-term-1',
            professorId: 'p1',
            status: 'active',
          },
        },
      ],
    };
    // ترم جدیدی هنوز باز نشده — دقیقاً همان سناریویی که با کد قدیمی گم می‌شد.
    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      null,
      [closedSemester]
    );
    expect(state.scenario).toBe('S5_term_active');
    expect(state.termId).toBe('closed-term-1');
    expect(state.termTitle).toContain('1404-1405');
  });

  it('shows the report page for a past completed term even when the student failed it', () => {
    const closedSemester: NestSemesterEnrolmentsByTerm = {
      id: 'closed-term-2',
      season: 'two',
      structure: 'semester',
      academicYears: '۱۴۰۴-۱۴۰۵',
      courseSelection: false,
      startClasses: true,
      lessons: [
        {
          id: 'closed-lesson-2',
          semesterId: 'closed-term-2',
          title: 'کارورزی ۱',
          status: true,
          enrolment: {
            id: 'enr-failed',
            lessonId: 'closed-lesson-2',
            semesterId: 'closed-term-2',
            professorId: 'p1',
            status: 'completed',
          },
        },
      ],
    };
    // نه انتخاب واحد باز است نه ترم جدیدی — فقط یک ترم گذشته با وضعیت
    // `completed` (چه قبول شده باشد چه رد) — باید صفحهٔ گزارش‌نویسی همان
    // ترم را ببیند، نه اینکه ماژول برایش کلاً غیرفعال باشد.
    const state = toEnrollmentPageState(
      { actor: student, level: 1 },
      null,
      [closedSemester]
    );
    expect(state.scenario).toBe('S5_term_active');
    expect(state.termId).toBe('closed-term-2');
  });

  it('returns S1 when Nest has no open semester and no enrolment history', () => {
    expect(parseOpenCourseSelection({})).toBeNull();
    const state = toEnrollmentPageState({ actor: student, level: 1 }, null, []);
    expect(state.scenario).toBe('S1_syllabus_blocked');
    expect(state.termId).toBe('');
  });

  it('maps professor rows with nested user or flat name fields', () => {
    expect(
      mapEnrollmentProfessor({
        professorId: 'p1',
        firstName: 'سارا',
        lastName: 'احمدی',
        university: { title: 'پردیس شهید باهنر تهران' },
        province: { title: 'تهران' },
        days: [0],
        remainingCapacity: 3,
      })
    ).toEqual({
      id: 'p1',
      name: 'سارا احمدی',
      college: 'پردیس شهید باهنر تهران',
      province: 'تهران',
      days: ['شنبه'],
      capacity: 3,
    });

    expect(
      mapEnrollmentProfessor({
        professor: { id: 'p2', name: 'دکتر نادر' },
        college: 'پردیس اصفهان',
        capacity: 2,
      })
    ).toMatchObject({
      id: 'p2',
      name: 'دکتر نادر',
      college: 'پردیس اصفهان',
      capacity: 2,
    });

    expect(mapEnrollmentProfessor({ firstName: 'بی‌شناسه' })).toBeNull();
  });

  it('filters professors only when the row has a matching field', () => {
    const rows = [
      {
        id: 'a',
        name: 'سارا احمدی',
        college: 'پردیس تهران',
        province: 'تهران',
        days: ['شنبه'],
        capacity: 1,
      },
      {
        id: 'b',
        name: 'نادر رحیمی',
        college: '',
        province: '',
        days: [],
        capacity: 1,
      },
    ];
    expect(
      filterSupervisorsClientSide(rows, {
        query: 'احمدی',
        province: 'تهران',
        college: 'پردیس تهران',
      }).map((item) => item.id)
    ).toEqual(['a']);
    expect(
      filterSupervisorsClientSide(rows, {
        query: '',
        province: 'اصفهان',
        college: '',
      }).map((item) => item.id)
    ).toEqual(['b']);
  });
});
