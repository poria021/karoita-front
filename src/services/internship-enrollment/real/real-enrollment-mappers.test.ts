import { describe, expect, it } from 'vitest';

import {
  buildRealEnrollmentContext,
  ENROLLMENT_UNSET_LABEL,
  findLessonForLevel,
  formatAttendanceDays,
  levelForLesson,
  parseNestEligibleProfessor,
  parseNestEligibleProfessorsResponse,
  parseOpenCourseSelectionBundle,
  parseRealStudentEnrollment,
  parseRealStudentEnrollmentPage,
  professorDisplayName,
  toInternshipSupervisor,
} from './real-enrollment-mappers';

const OPEN_SEMESTER_BUNDLE = {
  id: '6a96bc5ec0dbacb9d068188b',
  season: 'one',
  structure: 'semester',
  academicYears: '۱۴۰۵-۱۴۰۶',
  courseSelection: true,
  startClasses: false,
  lessons: [
    { id: 'lesson-1', title: 'کارورزی ۱', status: true },
    { id: 'lesson-2', title: 'کارورزی ۲', status: false },
  ],
};

describe('formatAttendanceDays', () => {
  it('maps 0-5 nest day indices to sorted unique persian weekday labels', () => {
    expect(formatAttendanceDays([1, 0])).toBe('شنبه، یکشنبه');
    expect(formatAttendanceDays([5])).toBe('پنجشنبه');
    expect(formatAttendanceDays([2, 2])).toBe('دوشنبه');
  });

  it('returns null for empty/invalid input', () => {
    expect(formatAttendanceDays(undefined)).toBeNull();
    expect(formatAttendanceDays([])).toBeNull();
    expect(formatAttendanceDays([9])).toBeNull();
  });
});

describe('levelForLesson / findLessonForLevel', () => {
  it('extracts the level from a persian lesson title', () => {
    expect(levelForLesson({ title: 'کارورزی ۳' })).toBe(3);
    expect(levelForLesson({ title: 'کارآموزی ۲' })).toBe(2);
  });

  it('finds the lesson matching a given level', () => {
    const lessons = [
      { id: 'l1', title: 'کارورزی ۱' },
      { id: 'l2', title: 'کارورزی ۲' },
    ];
    expect(findLessonForLevel(lessons, 2)?.id).toBe('l2');
    expect(findLessonForLevel(lessons, 4)).toBeNull();
  });
});

describe('parseOpenCourseSelectionBundle / buildRealEnrollmentContext', () => {
  it('parses the open-course-selection payload like a semesters_all bundle', () => {
    const bundle = parseOpenCourseSelectionBundle(OPEN_SEMESTER_BUNDLE);
    expect(bundle?.id).toBe('6a96bc5ec0dbacb9d068188b');
    expect(bundle?.lessons).toHaveLength(2);
  });

  it('resolves gates + configured lesson for an active level', () => {
    const bundle = parseOpenCourseSelectionBundle(OPEN_SEMESTER_BUNDLE);
    const context = buildRealEnrollmentContext(bundle, 1, '1405/06/06');
    expect(context.termId).toBe('6a96bc5ec0dbacb9d068188b');
    expect(context.enrollOpen).toBe(true);
    expect(context.termOpen).toBe(false);
    expect(context.syllabusConfigured).toBe(true);
    expect(context.lessonId).toBe('lesson-1');
  });

  it('treats a lesson that exists in open-course-selection as configured even when status=false', () => {
    // lesson.status روی درس یعنی «ارائه‌شده در سرفصل» (isOffered) نه ثبت‌نام.
    // وجود درس در پاسخ open-course-selection کافی است؛ status نباید syllabusConfigured را قطع کند.
    const bundle = parseOpenCourseSelectionBundle(OPEN_SEMESTER_BUNDLE);
    const context = buildRealEnrollmentContext(bundle, 2, '1405/06/06');
    expect(context.syllabusConfigured).toBe(true);
    expect(context.lessonId).toBe('lesson-2');
  });

  it('falls back to closed gates with no lesson when nothing is open', () => {
    const context = buildRealEnrollmentContext(null, 1, '1405/06/06');
    expect(context.termId).toBe('');
    expect(context.enrollOpen).toBe(false);
    expect(context.termOpen).toBe(false);
    expect(context.syllabusConfigured).toBe(false);
    expect(context.lessonId).toBeNull();
  });
});

describe('professors', () => {
  it('parses a professors-list row defensively', () => {
    const professor = parseNestEligibleProfessor({
      id: 'prof-1',
      firstName: 'سارا',
      lastName: 'احمدی',
      university: [{ id: 'u1', title: 'پردیس شهید باهنر تهران' }],
      capacity: 3,
      days: [0, 2],
    });
    expect(professor?.id).toBe('prof-1');
    expect(professorDisplayName(professor!)).toBe('سارا احمدی');
    expect(professor?.university?.[0]?.title).toBe('پردیس شهید باهنر تهران');
  });

  it('returns null for a row without an id', () => {
    expect(parseNestEligibleProfessor({ firstName: 'بی‌نام' })).toBeNull();
  });

  it('parses both the enveloped and raw-array response shapes', () => {
    const enveloped = parseNestEligibleProfessorsResponse({
      data: [{ id: 'p1', firstName: 'الف', lastName: 'ب', capacity: 1 }],
      hasNextPage: true,
    });
    expect(enveloped.data).toHaveLength(1);
    expect(enveloped.hasNextPage).toBe(true);

    const raw = parseNestEligibleProfessorsResponse([
      { id: 'p2', firstName: 'ج', lastName: 'د', capacity: 2 },
    ]);
    expect(raw.data).toHaveLength(1);
    expect(raw.hasNextPage).toBe(false);
  });

  it('maps a professor to the frontend InternshipSupervisor contract without inventing province', () => {
    const supervisor = toInternshipSupervisor({
      id: 'prof-1',
      firstName: 'سارا',
      lastName: 'احمدی',
      university: [{ id: 'u1', title: 'پردیس شهید باهنر تهران' }],
      capacity: 2,
      days: [0],
    });
    expect(supervisor).toEqual({
      id: 'prof-1',
      name: 'سارا احمدی',
      college: 'پردیس شهید باهنر تهران',
      province: ENROLLMENT_UNSET_LABEL,
      day: 'شنبه',
      capacity: 2,
    });
  });
});

describe('student enrollment records', () => {
  it('parses a plain enrollment row', () => {
    const record = parseRealStudentEnrollment({
      id: 'enr-1',
      studentId: 'stu-1',
      semesterId: 'sem-1',
      lessonId: 'lesson-1',
      professorId: 'prof-1',
      status: 'active',
      schoolId: null,
      teacherId: null,
    });
    expect(record).toEqual({
      id: 'enr-1',
      studentId: 'stu-1',
      semesterId: 'sem-1',
      lessonId: 'lesson-1',
      professorId: 'prof-1',
      status: 'active',
      schoolId: null,
      schoolTitle: null,
      teacherId: null,
      teacherTitle: null,
    });
  });

  it('resolves populated school/teacher relations', () => {
    const record = parseRealStudentEnrollment({
      id: 'enr-1',
      semesterId: 'sem-1',
      lessonId: 'lesson-1',
      professorId: 'prof-1',
      status: 'completed',
      schoolId: { id: 'school-1', title: 'دبیرستان ماندگار البرز' },
      teacherId: { id: 'teacher-1', name: 'آقای مرتضی ملکی' },
    });
    expect(record?.schoolId).toBe('school-1');
    expect(record?.schoolTitle).toBe('دبیرستان ماندگار البرز');
    expect(record?.teacherId).toBe('teacher-1');
    expect(record?.teacherTitle).toBe('آقای مرتضی ملکی');
    expect(record?.status).toBe('completed');
  });

  it('rejects a row missing required identifiers', () => {
    expect(
      parseRealStudentEnrollment({ id: 'enr-1', semesterId: 'sem-1' })
    ).toBeNull();
  });

  it('parses the raw-array GET /student-enrollments response', () => {
    const page = parseRealStudentEnrollmentPage([
      {
        id: 'enr-1',
        semesterId: 'sem-1',
        lessonId: 'lesson-1',
        professorId: 'prof-1',
        status: 'active',
      },
    ]);
    expect(page.data).toHaveLength(1);
    expect(page.hasNextPage).toBe(false);
  });
});
