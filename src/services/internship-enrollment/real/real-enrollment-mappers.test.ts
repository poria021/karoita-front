import { describe, expect, it } from 'vitest';

import {
  filterSupervisorsClientSide,
  findLessonForLevel,
  mapEnrollmentProfessor,
  parseOpenCourseSelection,
  toEnrollmentPageState,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import type { InternshipEnrollmentActor } from '@/types/internship-enrollment';

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
  season: 'one',
  structure: 'semester',
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

describe('real enrollment mappers', () => {
  it('parses open-course-selection and maps S3 when the lesson exists', () => {
    const parsed = parseOpenCourseSelection(OPEN);
    expect(parsed?.id).toBe('6a9a4c2dd62f2b45691e5616');
    expect(findLessonForLevel(parsed!.lessons ?? [], 'internship', 1)?.id).toBe(
      '6a9a4c2dd62f2b45691e5617'
    );

    const state = toEnrollmentPageState({ actor: student, level: 1 }, parsed);
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.termId).toBe('6a9a4c2dd62f2b45691e5616');
    expect(state.lessonId).toBe('6a9a4c2dd62f2b45691e5617');
    expect(state.termTitle).toContain('نیم‌سال اول');
    expect(state.selection?.scope.province).toBe('تهران');
  });

  it('maps S1 when the current level is missing from the open term', () => {
    const parsed = parseOpenCourseSelection(OPEN);
    const state = toEnrollmentPageState({ actor: student, level: 4 }, parsed);
    expect(state.scenario).toBe('S1_syllabus_blocked');
    expect(state.lessonId).toBeNull();
  });

  it('maps S3 when the offered lesson has status true but the student has no enrollment', () => {
    const parsed = parseOpenCourseSelection({
      ...OPEN,
      lessons: [{ ...OPEN.lessons[0], status: true }, OPEN.lessons[1]],
    });
    const state = toEnrollmentPageState({ actor: student, level: 1 }, parsed, {
      enrollments: [],
    });
    expect(state.scenario).toBe('S3_enroll_open');
    expect(state.enrollment).toBeNull();
  });

  it('maps S6 when listMine has another lesson of the same kind', () => {
    const parsed = parseOpenCourseSelection(OPEN);
    const state = toEnrollmentPageState({ actor: student, level: 1 }, parsed, {
      enrollments: [
        {
          id: 'enr-2',
          lessonId: OPEN.lessons[1].id,
          semesterId: OPEN.id,
          professorId: 'p1',
          status: 'active',
        },
      ],
    });
    expect(state.scenario).toBe('S6_already_enrolled_elsewhere');
    expect(state.conflictEnrollment).toEqual({
      level: 2,
      courseTitle: 'کارورزی ۲',
    });
  });

  it('maps S4 with a summary when listMine has this lesson', () => {
    const parsed = parseOpenCourseSelection({
      ...OPEN,
      lessons: [{ ...OPEN.lessons[0], status: true }, OPEN.lessons[1]],
    });
    const state = toEnrollmentPageState({ actor: student, level: 1 }, parsed, {
      enrollments: [
        {
          id: 'enr-1',
          lessonId: OPEN.lessons[0].id,
          semesterId: OPEN.id,
          professorId: 'p1',
          status: 'active',
        },
      ],
      supervisorName: 'سارا احمدی',
    });
    expect(state.scenario).toBe('S4_registered_waiting');
    expect(state.enrollment?.courseTitle).toBe('کارورزی 1');
    expect(state.enrollment?.supervisorName).toBe('سارا احمدی');
    // `student-weeks` هنوز به فرانت وصل نشده؛ خارج از real+production
    // (اینجا: تست) به‌جای خالی ماندن با mock پر می‌شود (رجوع به enrollment-summary.ts).
    expect(state.enrollment?.weeks.length).toBeGreaterThan(0);
  });

  it('returns S1 when Nest has no open semester', () => {
    expect(parseOpenCourseSelection({})).toBeNull();
    const state = toEnrollmentPageState({ actor: student, level: 1 }, null);
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
      day: 'شنبه',
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
        day: 'شنبه',
        capacity: 1,
      },
      {
        id: 'b',
        name: 'نادر رحیمی',
        college: '',
        province: '',
        day: '',
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
