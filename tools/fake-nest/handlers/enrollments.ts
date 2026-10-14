/**
 * ثبت‌نام دانشجو/مهارت‌آموز: انتخاب ترم باز و استاد، فهرست‌ها برای استاد/معلم/مدیر
 * مدرسه، هفته‌ها و خلاصه‌ی نمره.
 */
import {
  assertEnrollmentAccess,
  createEnrollmentRecords,
  enrollmentDto,
  enrollmentListItem,
  findEnrollment,
  isLearner,
  lessonBlockReason,
  remainingProfessorCapacity,
  requireRole,
  requireUser,
  studentWeekDto,
  studentWeeksOf,
} from '../domain';
import { HttpError, noContent, ok } from '../http';
import type { Router } from '../router';
import {
  nowIso,
  paginate,
  type Store,
  type StoredEnrollment,
  type StoredSemester,
  type StoredUser,
} from '../store';

type CreateBody = {
  semesterId: string;
  lessonId: string;
  professorId: string;
  schoolId?: string;
  teacherId?: string;
};

function requiredQuery(query: URLSearchParams, ...names: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const name of names) {
    const value = query.get(name);
    if (!value) errors[name] = `${name} should not be empty`;
    else values[name] = value;
  }
  if (Object.keys(errors).length > 0) throw new HttpError(422, 'Unprocessable Entity', errors);
  return values;
}

/** دانشجو ترمی، مهارت‌آموز پودمانی (Swagger: «ترم باز برای دانشجو و مهارت‌آموز»). */
function structureOf(user: StoredUser): StoredSemester['structure'] {
  return user.roleName === 'trainee' ? 'podmani' : 'semester';
}

function mineFirst(rows: StoredEnrollment[]): StoredEnrollment | undefined {
  const rank = { active: 0, completed: 1, cancelled: 2 } as const;
  return [...rows].sort(
    (a, b) => rank[a.status] - rank[b.status] || b.createdAt.localeCompare(a.createdAt)
  )[0];
}

export function registerEnrollmentRoutes(router: Router, store: Store): void {
  router.register('post', '/api/v1/student-enrollments', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'student', 'trainee');
    const body = context.body as CreateBody;

    const semester = store.semesters.get(body.semesterId);
    if (!semester) throw new HttpError(404, 'Semester not found');
    if (!semester.courseSelection) throw new HttpError(400, 'Course selection is not open.');
    if (semester.structure !== structureOf(user)) {
      throw new HttpError(400, 'This semester is not for your role.');
    }
    const lesson = store.lessons.get(body.lessonId);
    if (!lesson || lesson.semesterId !== semester.id || !lesson.status) {
      throw new HttpError(400, 'Lesson is not offered in this semester.');
    }
    const blocked = lessonBlockReason(store, user.id, lesson.id);
    if (blocked) throw new HttpError(400, `Lesson cannot be selected (${blocked}).`);

    const professor = store.users.get(body.professorId);
    if (!professor || professor.roleName !== 'mentor') {
      throw new HttpError(404, 'Professor not found');
    }
    if (remainingProfessorCapacity(store, professor.id, semester.id, lesson.id) <= 0) {
      throw new HttpError(400, 'Professor has no remaining capacity.');
    }

    if (body.schoolId && !store.schools.has(body.schoolId)) {
      throw new HttpError(404, 'School not found');
    }
    if (body.teacherId) {
      const teacher = store.users.get(body.teacherId);
      if (!teacher || teacher.roleName !== 'teacher') throw new HttpError(404, 'Teacher not found');
      if (body.schoolId && teacher.schoolId !== body.schoolId) {
        throw new HttpError(400, 'Teacher does not belong to this school.');
      }
    }

    createEnrollmentRecords(store, {
      studentId: user.id,
      semesterId: semester.id,
      lessonId: lesson.id,
      professorId: professor.id,
      schoolId: body.schoolId ?? null,
      teacherId: body.teacherId ?? null,
    });
    return noContent();
  });

  router.register('get', '/api/v1/student-enrollments', (context) => {
    const user = requireUser(store, context);
    const rows = [...store.enrollments.values()].filter((row) => row.studentId === user.id);
    const paged = context.query.has('page') || context.query.has('limit');
    const items = paged ? paginate(rows, context.query).data : rows;
    return ok(items.map((row) => enrollmentListItem(store, row)));
  });

  router.register('get', '/api/v1/student-enrollments/by-semester', (context) => {
    const user = requireUser(store, context);
    return ok(
      [...store.semesters.values()].map((semester) => ({
        id: semester.id,
        season: semester.season,
        structure: semester.structure,
        academicYears: semester.academicYear,
        courseSelection: semester.courseSelection,
        startCourseSelection: null,
        startClasses: semester.startClasses,
        startClassesAt: null,
        lessons: [...store.lessons.values()]
          .filter((lesson) => lesson.semesterId === semester.id)
          .map((lesson) => {
            const enrolment = mineFirst(
              [...store.enrollments.values()].filter(
                (row) => row.studentId === user.id && row.lessonId === lesson.id
              )
            );
            return {
              id: lesson.id,
              semesterId: semester.id,
              title: lesson.title,
              status: lesson.status,
              enrolment: enrolment ? enrollmentListItem(store, enrolment) : null,
            };
          }),
      }))
    );
  });

  router.register('get', '/api/v1/student-enrollments/open-course-selection', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'student', 'trainee');
    const semester = [...store.semesters.values()].find(
      (row) => row.courseSelection && row.structure === structureOf(user)
    );
    if (!semester) throw new HttpError(404, 'No semester is open for course selection.');
    return ok({
      id: semester.id,
      academicYear: semester.academicYear,
      season: semester.season,
      structure: semester.structure,
      courseSelection: semester.courseSelection,
      startClasses: semester.startClasses,
      lessons: [...store.lessons.values()]
        .filter((lesson) => lesson.semesterId === semester.id)
        .map((lesson) => {
          const blockReason = lessonBlockReason(store, user.id, lesson.id);
          return {
            id: lesson.id,
            semesterId: semester.id,
            title: lesson.title,
            status: lesson.status,
            canSelect: lesson.status && !blockReason,
            ...(blockReason ? { blockReason } : {}),
          };
        }),
    });
  });

  router.register('get', '/api/v1/student-enrollments/professors', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'student', 'trainee');
    const { semesterId, lessonId } = requiredQuery(context.query, 'semesterId', 'lessonId');
    const rows = [...store.users.values()]
      .filter((professor) => professor.roleName === 'mentor')
      .map((professor) => {
        const capacityRows = [...store.professorCapacities.values()].filter(
          (row) =>
            row.professorId === professor.id &&
            row.semesterId === semesterId &&
            row.lessonId === lessonId
        );
        return {
          professor,
          remaining: remainingProfessorCapacity(store, professor.id, semesterId, lessonId),
          days: [...new Set(capacityRows.flatMap((row) => row.days))].sort(),
          hasCapacityRow: capacityRows.length > 0,
        };
      })
      .filter((row) => row.hasCapacityRow && row.remaining > 0);
    const page = paginate(rows, context.query);
    return ok({
      data: page.data.map((row) => ({
        id: row.professor.id,
        firstName: row.professor.firstName,
        lastName: row.professor.lastName,
        photo: null,
        university: [],
        // برنامه «ظرفیت باقی‌مانده» را می‌خواند (`professorRemaining`).
        capacity: row.remaining,
        days: row.days,
      })),
      hasNextPage: page.hasNextPage,
    });
  });

  router.register('get', '/api/v1/student-enrollments/teachers', (context) => {
    requireUser(store, context);
    const { schoolId } = requiredQuery(context.query, 'schoolId');
    return ok(
      [...store.users.values()]
        .filter((user) => user.roleName === 'teacher' && user.schoolId === schoolId)
        .map((user) => ({ id: user.id, firstName: user.firstName, lastName: user.lastName }))
    );
  });

  router.register('get', '/api/v1/student-enrollments/mentor/students', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'mentor', 'teacher', 'school_admin');
    const semesterId = context.query.get('semesterId');
    const lessonId = context.query.get('lessonId');
    const rows = [...store.enrollments.values()].filter((row) => {
      const mine =
        user.roleName === 'mentor'
          ? row.professorId === user.id
          : user.roleName === 'teacher'
            ? row.teacherId === user.id
            : Boolean(user.schoolId) && row.schoolId === user.schoolId;
      return (
        mine &&
        (!semesterId || row.semesterId === semesterId) &&
        (!lessonId || row.lessonId === lessonId)
      );
    });
    const page = paginate(rows, context.query);
    return ok({
      data: page.data.map((row) => {
        const student = store.users.get(row.studentId);
        return {
          ...enrollmentDto(row),
          student: {
            id: row.studentId,
            firstName: student?.firstName ?? null,
            lastName: student?.lastName ?? null,
            phone: student?.phone ?? null,
            photo: null,
            roleName: student?.roleName ?? null,
          },
        };
      }),
      hasNextPage: page.hasNextPage,
    });
  });

  router.register('get', '/api/v1/student-enrollments/mentor/capacity', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'mentor');
    const { semesterId } = requiredQuery(context.query, 'semesterId');
    const all = [...store.professorCapacities.values()]
      .filter((row) => row.professorId === user.id && row.semesterId === semesterId)
      .reduce((sum, row) => sum + row.capacity, 0);
    const selected = [...store.enrollments.values()].filter(
      (row) =>
        row.professorId === user.id && row.semesterId === semesterId && row.status === 'active'
    ).length;
    return ok({
      semesterId,
      allTeacherCapacity: all,
      selected,
      remain: all - selected,
    });
  });

  router.register('get', '/api/v1/student-enrollments/{id}', (context) => {
    const user = requireUser(store, context);
    const enrollment = findEnrollment(store, context.params.id!);
    assertEnrollmentAccess(store, user, enrollment);
    return ok(enrollmentDto(enrollment));
  });

  router.register('patch', '/api/v1/student-enrollments/{id}', (context) => {
    const user = requireUser(store, context);
    const enrollment = findEnrollment(store, context.params.id!);
    if (!isLearner(user) || enrollment.studentId !== user.id) {
      throw new HttpError(403, 'Forbidden');
    }
    const body = context.body as { schoolId?: string; teacherId?: string };
    const schoolId = body.schoolId ?? enrollment.schoolId;
    if (body.schoolId && !store.schools.has(body.schoolId)) {
      throw new HttpError(404, 'School not found');
    }
    if (body.teacherId) {
      const teacher = store.users.get(body.teacherId);
      if (!teacher || teacher.roleName !== 'teacher') throw new HttpError(404, 'Teacher not found');
      if (schoolId && teacher.schoolId !== schoolId) {
        throw new HttpError(400, 'Teacher does not belong to this school.');
      }
    }
    if (body.schoolId !== undefined) enrollment.schoolId = body.schoolId;
    if (body.teacherId !== undefined) enrollment.teacherId = body.teacherId;
    enrollment.updatedAt = nowIso();
    return ok(enrollmentDto(enrollment));
  });

  router.register('patch', '/api/v1/student-enrollments/{id}/cancel', (context) => {
    const user = requireUser(store, context);
    const enrollment = findEnrollment(store, context.params.id!);
    // دانشجوی خودِ ثبت‌نام یا استاد راهنما (حذف کارورز از کلاس در صفحه‌ی ارزیابی).
    if (enrollment.studentId !== user.id && enrollment.professorId !== user.id) {
      throw new HttpError(403, 'Forbidden');
    }
    if (enrollment.status === 'cancelled') throw new HttpError(400, 'Enrollment already cancelled.');
    enrollment.status = 'cancelled';
    enrollment.updatedAt = nowIso();
    return { status: 200 };
  });

  router.register('get', '/api/v1/student-enrollments/{id}/weeks', (context) => {
    const user = requireUser(store, context);
    const enrollment = findEnrollment(store, context.params.id!);
    assertEnrollmentAccess(store, user, enrollment);
    return ok(studentWeeksOf(store, enrollment.id).map((week) => studentWeekDto(store, week)));
  });

  /**
   * فرمول‌ها تقریب‌اند (Swagger فقط عنوان فیلدها را دارد): مجموع نمره، تعداد هفته‌ی
   * نمره‌گرفته، سقف = هفته×۱۰۰، و نمره‌ی وزنی از ۲۰ بر اساس ضریب هفته‌ها.
   */
  router.register('get', '/api/v1/student-enrollments/{id}/score-summary', (context) => {
    const user = requireUser(store, context);
    const enrollment = findEnrollment(store, context.params.id!);
    assertEnrollmentAccess(store, user, enrollment);
    const weeks = studentWeeksOf(store, enrollment.id);
    const scored = weeks.filter((week) => week.status === 'completed' && week.score !== null);
    const priority = (weekId: string) => store.weeks.get(weekId)?.priority ?? 1;
    const earned = scored.reduce((sum, week) => sum + week.score! * priority(week.weekId), 0);
    const possible = weeks.reduce((sum, week) => sum + 100 * priority(week.weekId), 0);
    return ok({
      totalScore: scored.reduce((sum, week) => sum + week.score!, 0),
      scoredWeeks: scored.length,
      totalWeeks: weeks.length,
      maximumScore: weeks.length * 100,
      weightedScore: possible === 0 ? 0 : Math.round((earned / possible) * 20 * 100) / 100,
    });
  });

}
