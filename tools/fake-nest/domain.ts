/**
 * منطق مشترک ثبت‌نام، هفته‌ها و گفتگوها. قانون‌های این‌جا از توضیح Swagger
 * (نقش مجاز هر endpoint، `canSelect/blockReason`، «گفتگو خودکار ساخته می‌شود») و
 * یادداشت‌های تست‌شده‌ی فرانت روی بک‌اند زنده می‌آیند؛ فرمول‌های نمره تقریب‌اند و
 * با بک‌اند واقعی تفاوت دارند (در Swagger فقط عنوان فیلدها آمده).
 */
import { HttpError, type RouteContext } from './http';
import {
  newId,
  nowIso,
  type Store,
  type StoredConversation,
  type StoredEnrollment,
  type StoredMessage,
  type StoredStudentWeek,
  type StoredUser,
  type StoredWeek,
} from './store';

export type RoleName = 'student' | 'trainee' | 'mentor' | 'teacher' | 'school_admin';

export function isLearner(user: StoredUser): boolean {
  return user.roleName === 'student' || user.roleName === 'trainee';
}

/** حساب کاربر (نه ادمین) از روی توکن؛ بدون آن ۴۰۳ مثل نقش ناسازگار. */
export function requireUser(store: Store, context: RouteContext): StoredUser {
  const session = context.session;
  if (!session || session.surface !== 'user') throw new HttpError(403, 'Forbidden');
  const user = store.users.get(session.accountId);
  if (!user) throw new HttpError(401, 'Unauthorized');
  return user;
}

export function requireRole(user: StoredUser, ...roles: RoleName[]): void {
  if (!roles.includes(user.roleName as RoleName)) throw new HttpError(403, 'Forbidden');
}

export function weeksOfLessonDefinition(store: Store, lessonId: string): StoredWeek[] {
  return [...store.weeks.values()].filter((week) => week.lessonId === lessonId);
}

export function studentWeeksOf(store: Store, enrollmentId: string): StoredStudentWeek[] {
  return [...store.studentWeeks.values()].filter((week) => week.enrollmentId === enrollmentId);
}

/** مدیران مدرسه‌ی همان مدرسه (برای مشارکت در گفتگو و دیدن ثبت‌نام‌ها). */
export function schoolAdminIds(store: Store, schoolId: string | null): string[] {
  if (!schoolId) return [];
  return [...store.users.values()]
    .filter((user) => user.roleName === 'school_admin' && user.schoolId === schoolId)
    .map((user) => user.id);
}

export function participantIds(store: Store, enrollment: StoredEnrollment): string[] {
  const ids = [enrollment.studentId, enrollment.professorId];
  if (enrollment.teacherId) ids.push(enrollment.teacherId);
  ids.push(...schoolAdminIds(store, enrollment.schoolId));
  return [...new Set(ids)];
}

export function canAccessEnrollment(
  store: Store,
  user: StoredUser,
  enrollment: StoredEnrollment
): boolean {
  return participantIds(store, enrollment).includes(user.id);
}

export function assertEnrollmentAccess(
  store: Store,
  user: StoredUser,
  enrollment: StoredEnrollment
): void {
  if (!canAccessEnrollment(store, user, enrollment)) throw new HttpError(403, 'Forbidden');
}

export function findEnrollment(store: Store, id: string): StoredEnrollment {
  const row = store.enrollments.get(id);
  if (!row) throw new HttpError(404, 'Enrollment not found');
  return row;
}

function personSummary(store: Store, userId: string | null) {
  const user = userId ? store.users.get(userId) : undefined;
  if (!user) return null;
  return { id: user.id, firstName: user.firstName, lastName: user.lastName };
}

/** `StudentEnrollmentListItemDto`. */
export function enrollmentListItem(store: Store, enrollment: StoredEnrollment) {
  const school = enrollment.schoolId ? store.schools.get(enrollment.schoolId) : undefined;
  return {
    id: enrollment.id,
    studentId: enrollment.studentId,
    semesterId: enrollment.semesterId,
    lessonId: enrollment.lessonId,
    schoolId: enrollment.schoolId,
    teacherId: enrollment.teacherId,
    professorId: enrollment.professorId,
    status: enrollment.status,
    startedAt: enrollment.startedAt,
    completedAt: enrollment.completedAt,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
    school: school ? { id: school.id, title: school.title } : null,
    teacher: personSummary(store, enrollment.teacherId),
    professor: personSummary(store, enrollment.professorId),
  };
}

/** `StudentEnrollment` (GET/PATCH تکی). */
export function enrollmentDto(enrollment: StoredEnrollment) {
  return {
    id: enrollment.id,
    studentId: enrollment.studentId,
    semesterId: enrollment.semesterId,
    lessonId: enrollment.lessonId,
    schoolId: enrollment.schoolId,
    teacherId: enrollment.teacherId,
    professorId: enrollment.professorId,
    status: enrollment.status,
    startedAt: enrollment.startedAt,
    completedAt: enrollment.completedAt,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
  };
}

/**
 * `StudentWeekResponseDto` + فیلدهای زنده‌ی بدون Swagger. `weekId` همان‌طور که
 * خلاصه‌ی Swagger می‌گوید («populated with its week definition») سند هفته است.
 */
export function studentWeekDto(store: Store, week: StoredStudentWeek) {
  const definition = store.weeks.get(week.weekId);
  return {
    id: week.id,
    enrollmentId: week.enrollmentId,
    weekId: definition
      ? {
          id: definition.id,
          lessonId: definition.lessonId,
          priority: definition.priority,
          status: definition.status,
        }
      : week.weekId,
    status: week.status,
    score: week.score,
    weightedScore: week.weightedScore,
    scoreGivenBy: week.scoreGivenBy,
    scoreGivenAt: week.scoreGivenAt,
    startedAt: week.startedAt,
    submittedAt: week.submittedAt,
    completedAt: week.completedAt,
    createdAt: week.createdAt,
    updatedAt: week.updatedAt,
    studentStatus: week.studentStatus,
    mentorStatus: week.mentorStatus,
    teacherStatus: week.teacherStatus,
    schoolAdminStatus: week.schoolAdminStatus,
    schoolVisited: week.schoolVisited,
    isMentorPresent: week.isMentorPresent,
    isApprovedBySchoolAdminMentorPresent: week.isApprovedBySchoolAdminMentorPresent,
    mentorPresentAt: week.mentorPresentAt,
    isApprovedBySchoolAdminStudentPresent: week.isApprovedBySchoolAdminStudentPresent,
    studentPresentAt: week.studentPresentAt,
    canWatchOthers: week.canWatchOthers,
  };
}

function blankStudentWeek(enrollmentId: string, weekId: string): StoredStudentWeek {
  const now = nowIso();
  return {
    id: newId(),
    enrollmentId,
    weekId,
    status: 'pending',
    score: null,
    weightedScore: null,
    scoreGivenBy: null,
    scoreGivenAt: null,
    startedAt: null,
    submittedAt: null,
    completedAt: null,
    studentStatus: null,
    mentorStatus: null,
    teacherStatus: null,
    schoolAdminStatus: null,
    schoolVisited: false,
    isMentorPresent: false,
    isApprovedBySchoolAdminMentorPresent: false,
    mentorPresentAt: null,
    isApprovedBySchoolAdminStudentPresent: false,
    studentPresentAt: null,
    canWatchOthers: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * ثبت‌نام + یک هفته‌ی دانشجو برای هر هفته‌ی درس + گفتگوها. Swagger هیچ
 * `POST /conversations` ندارد؛ فرانت فرض می‌کند بک‌اند هنگام ثبت‌نام آن‌ها را
 * می‌سازد (یک `general` و یک `week` برای هر هفته).
 */
export function createEnrollmentRecords(
  store: Store,
  input: {
    studentId: string;
    semesterId: string;
    lessonId: string;
    professorId: string;
    schoolId?: string | null;
    teacherId?: string | null;
  }
): StoredEnrollment {
  const now = nowIso();
  const enrollment: StoredEnrollment = {
    id: newId(),
    studentId: input.studentId,
    semesterId: input.semesterId,
    lessonId: input.lessonId,
    schoolId: input.schoolId ?? null,
    teacherId: input.teacherId ?? null,
    professorId: input.professorId,
    status: 'active',
    startedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  store.enrollments.set(enrollment.id, enrollment);

  const definitions = weeksOfLessonDefinition(store, input.lessonId);
  for (const definition of definitions) {
    const week = blankStudentWeek(enrollment.id, definition.id);
    store.studentWeeks.set(week.id, week);
  }

  const conversation = (weekId: string | null): StoredConversation => ({
    id: newId(),
    enrollmentId: enrollment.id,
    weekId,
    type: weekId ? 'week' : 'general',
    readStates: new Map(),
    createdAt: now,
    updatedAt: now,
  });
  for (const created of [
    conversation(null),
    ...definitions.map((definition) => conversation(definition.id)),
  ]) {
    store.conversations.set(created.id, created);
  }
  return enrollment;
}

/** ظرفیت باقی‌مانده‌ی استاد برای یک درس/ترم: ظرفیت ثبت‌شده منهای ثبت‌نام‌های فعال. */
export function remainingProfessorCapacity(
  store: Store,
  professorId: string,
  semesterId: string,
  lessonId: string
): number {
  const rows = [...store.professorCapacities.values()].filter(
    (row) =>
      row.professorId === professorId &&
      row.semesterId === semesterId &&
      row.lessonId === lessonId
  );
  const total = rows.reduce((sum, row) => sum + row.capacity, 0);
  const used = [...store.enrollments.values()].filter(
    (row) =>
      row.status === 'active' &&
      row.professorId === professorId &&
      row.semesterId === semesterId &&
      row.lessonId === lessonId
  ).length;
  return total - used;
}

/** `canSelect/blockReason` (Swagger): ثبت‌نام فعال → in_progress، قبلاً قبول‌شده → passed. */
export function lessonBlockReason(
  store: Store,
  studentId: string,
  lessonId: string
): 'in_progress' | 'passed' | null {
  const mine = [...store.enrollments.values()].filter(
    (row) => row.studentId === studentId && row.lessonId === lessonId
  );
  if (mine.some((row) => row.status === 'active')) return 'in_progress';
  if (mine.some((row) => row.status === 'completed')) return 'passed';
  return null;
}

/** وضعیت کارت هفته بر اساس نقش فرستنده؛ هفته‌ی نمره‌گرفته دیگر عوض نمی‌شود. */
function applyWeekState(week: StoredStudentWeek, role: string): void {
  if (week.status === 'completed') return;
  const now = nowIso();
  if (role === 'student' || role === 'trainee') {
    week.studentStatus = 'send';
    week.mentorStatus = null; // ارسال دوباره بعد از رد
    week.status = 'submitted';
    week.startedAt ??= now;
    week.submittedAt = now;
  } else if (role === 'mentor') {
    week.mentorStatus = 'send';
    week.status = 'in_progress';
  } else if (role === 'teacher') {
    week.teacherStatus = 'send';
  } else if (role === 'school_admin') {
    week.schoolAdminStatus = 'send';
  }
  week.updatedAt = now;
}

/** افزودن پیام و اعمال وضعیت هفته — بدون اعتبارسنجی (handler و seed هر دو صدا می‌زنند). */
export function appendMessage(
  store: Store,
  conversation: StoredConversation,
  sender: StoredUser,
  content: { text?: string | null; fileIds?: string[]; rating?: number | null }
): StoredMessage {
  const sequence = messagesOf(store, conversation.id).length + 1;
  const now = nowIso();
  const message: StoredMessage = {
    id: newId(),
    conversationId: conversation.id,
    senderId: sender.id,
    senderRole: sender.roleName,
    text: content.text ?? null,
    fileIds: content.fileIds ?? [],
    rating: content.rating ?? null,
    sequence,
    createdAt: now,
    updatedAt: now,
  };
  store.messages.push(message);
  conversation.readStates.set(sender.id, { lastReadSequence: sequence, lastReadAt: now });
  if (conversation.type === 'week' && conversation.weekId) {
    const week = [...store.studentWeeks.values()].find(
      (row) => row.enrollmentId === conversation.enrollmentId && row.weekId === conversation.weekId
    );
    if (week) applyWeekState(week, sender.roleName);
  }
  return message;
}

export function messagesOf(store: Store, conversationId: string): StoredMessage[] {
  return store.messages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => a.sequence - b.sequence);
}

/** تقریب فکری امتیاز هفته (نمره × ضریب)؛ فرمول واقعی بک‌اند مستند نیست. */
export function weightedScoreOf(store: Store, week: StoredStudentWeek, score: number): number {
  const priority = store.weeks.get(week.weekId)?.priority ?? 1;
  return score * priority;
}
