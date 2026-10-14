/**
 * اقدام روی هفته‌ی دانشجو: نمره و حضور استاد (فقط استاد راهنمای همان ثبت‌نام)،
 * تأیید حضور (فقط مدیر مدرسه‌ی همان مدرسه)، اجازه‌ی دیدن گزارش دیگران (استاد).
 * نقش مجاز هر endpoint از توضیح Swagger می‌آید («mentor only»، «school_admin only»).
 */
import {
  assertEnrollmentAccess,
  findEnrollment,
  requireRole,
  requireUser,
  weightedScoreOf,
} from '../domain';
import { HttpError, type RouteContext } from '../http';
import type { Router } from '../router';
import { nowIso, type Store, type StoredEnrollment, type StoredStudentWeek, type StoredUser } from '../store';

function loadWeek(
  store: Store,
  context: RouteContext
): { week: StoredStudentWeek; enrollment: StoredEnrollment; user: StoredUser } {
  const user = requireUser(store, context);
  const week = store.studentWeeks.get(context.params.id!);
  if (!week) throw new HttpError(404, 'Student week not found');
  const enrollment = findEnrollment(store, week.enrollmentId);
  assertEnrollmentAccess(store, user, enrollment);
  return { week, enrollment, user };
}

function requireProfessorOf(user: StoredUser, enrollment: StoredEnrollment): void {
  requireRole(user, 'mentor');
  if (enrollment.professorId !== user.id) throw new HttpError(403, 'Forbidden');
}

function requireSchoolAdminOf(user: StoredUser, enrollment: StoredEnrollment): void {
  requireRole(user, 'school_admin');
  if (!enrollment.schoolId || user.schoolId !== enrollment.schoolId) {
    throw new HttpError(403, 'Forbidden');
  }
}

function touch(week: StoredStudentWeek): { status: number } {
  week.updatedAt = nowIso();
  return { status: 200 };
}

export function registerStudentWeekRoutes(router: Router, store: Store): void {
  router.register('patch', '/api/v1/student-weeks/{id}/score', (context) => {
    const { week, enrollment, user } = loadWeek(store, context);
    requireProfessorOf(user, enrollment);
    if (enrollment.status === 'cancelled') {
      throw new HttpError(400, 'Enrollment is cancelled.');
    }
    const body = context.body as { score: number; schoolVisited?: boolean };
    if (body.score < 0 || body.score > 100) {
      throw new HttpError(422, 'Unprocessable Entity', { score: 'score must be between 0 and 100' });
    }
    const now = nowIso();
    week.status = 'completed';
    week.score = body.score;
    week.weightedScore = weightedScoreOf(store, week, body.score);
    week.scoreGivenBy = user.id;
    week.scoreGivenAt = now;
    week.completedAt = now;
    // بعد از نمره، فیلد استاد مقدار `score` می‌گیرد (یادداشت فرانت از لایو).
    week.mentorStatus = 'score';
    // `schoolVisited` در بدنه Swagger نیست ولی فرانت همراه نمره می‌فرستد.
    if (typeof body.schoolVisited === 'boolean') week.schoolVisited = body.schoolVisited;
    return touch(week);
  });

  router.register('patch', '/api/v1/student-weeks/{id}/mentor-present', (context) => {
    const { week, enrollment, user } = loadWeek(store, context);
    requireProfessorOf(user, enrollment);
    const { isMentorPresent } = context.body as { isMentorPresent: boolean };
    week.isMentorPresent = isMentorPresent;
    return touch(week);
  });

  router.register('patch', '/api/v1/student-weeks/{id}/approve-mentor-present', (context) => {
    const { week, enrollment, user } = loadWeek(store, context);
    requireSchoolAdminOf(user, enrollment);
    const body = context.body as {
      isApprovedBySchoolAdminMentorPresent: boolean;
      mentorPresentAt?: string;
    };
    week.isApprovedBySchoolAdminMentorPresent = body.isApprovedBySchoolAdminMentorPresent;
    week.mentorPresentAt = body.isApprovedBySchoolAdminMentorPresent
      ? (body.mentorPresentAt ?? nowIso())
      : null;
    return touch(week);
  });

  router.register('patch', '/api/v1/student-weeks/{id}/approve-student-present', (context) => {
    const { week, enrollment, user } = loadWeek(store, context);
    requireSchoolAdminOf(user, enrollment);
    const body = context.body as {
      isApprovedBySchoolAdminStudentPresent: boolean;
      studentPresentAt?: string;
    };
    week.isApprovedBySchoolAdminStudentPresent = body.isApprovedBySchoolAdminStudentPresent;
    week.studentPresentAt = body.isApprovedBySchoolAdminStudentPresent
      ? (body.studentPresentAt ?? nowIso())
      : null;
    return touch(week);
  });

  router.register('patch', '/api/v1/student-weeks/{id}/can-watch-others', (context) => {
    const { week, enrollment, user } = loadWeek(store, context);
    requireProfessorOf(user, enrollment);
    const { canWatchOthers } = context.body as { canWatchOthers: boolean };
    week.canWatchOthers = canWatchOthers;
    return touch(week);
  });
}
