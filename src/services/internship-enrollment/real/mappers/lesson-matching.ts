import {
  nestEntityId,
  nestLessonTitle,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
} from '@/types/internship-enrollment';
import type {
  NestOpenCourseSelection,
  NestSemesterEnrolmentsByTerm,
  NestSemesterLessonWithEnrolment,
  NestStudentEnrollment,
} from '@/types/nest-student-enrollments';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import { isRecord } from './primitives';

export function lessonMatchesKind(
  title: string,
  kind: InternshipCourseKind
): boolean {
  const normalized = persianToEnglishDigits(title);
  if (kind === 'apprenticeship') {
    return /کارآموزی|مهارت/.test(title) || /apprentice|skill/i.test(normalized);
  }
  return /کارورزی/.test(title) || /intern/i.test(normalized);
}

/**
 * سطح درس از عنوان، سخت‌گیرانه: اولین عدد مستقل ۱…۹ (نه رقمی از سال مثل ۱۴۰۴).
 * عنوان بی‌عدد `null` می‌دهد تا به‌اشتباه «سطح ۱» حساب نشود — برخلاف
 * `lessonLevelFromTitle` که برای نمایش، پیش‌فرض ۱ برمی‌گرداند.
 */
export function strictLessonLevelFromTitle(title: string): number | null {
  for (const match of persianToEnglishDigits(title).matchAll(/\d+/g)) {
    const value = Number(match[0]);
    if (value >= 1 && value <= 9) return value;
  }
  return null;
}

/**
 * تنها نقطهٔ تطبیق lesson Nest با level مسیر (`/internships/:level`).
 * چون هر ترم lesson خودش را دارد و `lessonId` بین ترم‌ها پایدار نیست، و Nest
 * هنوز شناسهٔ کاتالوگ (`courseId`) روی lesson نمی‌دهد، فعلاً ناچار عنوان است.
 * وقتی کاتالوگ بکند آمد فقط همین تابع باید به `courseId` تکیه کند.
 */
export function lessonMatchesLevel(
  lesson: { title?: string; name?: string; title_fa?: string },
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): boolean {
  const title = nestLessonTitle(lesson);
  return lessonMatchesKind(title, kind) && strictLessonLevelFromTitle(title) === level;
}

/** جنریک تا فیلدهای اضافهٔ شکل خاص هر endpoint (`canSelect`, `enrolment`, ...) از دست نرود. */
export function findLessonForLevel<
  T extends { title?: string; name?: string; title_fa?: string },
>(lessons: T[], kind: InternshipCourseKind, level: InternshipEnrollmentLevel): T | null {
  return lessons.find((lesson) => lessonMatchesLevel(lesson, kind, level)) ?? null;
}

export function parseOpenCourseSelection(
  raw: unknown
): NestOpenCourseSelection | null {
  if (!isRecord(raw)) return null;
  const doc = isRecord(raw._doc) ? raw._doc : raw;
  const id = nestEntityId({
    id: typeof doc.id === 'string' ? doc.id : undefined,
    _id: typeof doc._id === 'string' ? doc._id : undefined,
  });
  if (!id) return null;
  const lessons = Array.isArray(doc.lessons)
    ? (doc.lessons as NestOpenCourseSelection['lessons'])
    : [];
  return {
    id,
    academicYear:
      typeof doc.academicYear === 'string' ? doc.academicYear : undefined,
    academicYears:
      typeof doc.academicYears === 'string' ? doc.academicYears : undefined,
    season:
      doc.season === 'two' || doc.season === 'summer' ? doc.season : 'one',
    structure:
      typeof doc.structure === 'string' && doc.structure
        ? (doc.structure as NestOpenCourseSelection['structure'])
        : 'semester',
    courseSelection:
      typeof doc.courseSelection === 'boolean' ? doc.courseSelection : undefined,
    startClasses:
      typeof doc.startClasses === 'boolean' ? doc.startClasses : undefined,
    lessons,
  };
}

function isNonCancelledEnrolment(status: NestStudentEnrollment['status']): boolean {
  return status !== 'cancelled' && status !== 'dropped';
}

/**
 * `by-semester` برای هر (ترم، درس) فقط *یک* `enrolment` می‌دهد؛ وقتی دانشجو
 * همان درس را بعد از مردودی دوباره می‌گیرد، بک‌اند ردیف قدیمی را نگه می‌دارد و
 * ثبت‌نام تازه دیده نمی‌شود. لیست کامل `GET /student-enrollments` همهٔ ردیف‌ها
 * را دارد، پس برای هر (ترم، درس) ردیف مؤثر را از آن برمی‌داریم: `active` اول،
 * بعد جدیدترین غیرلغوشده؛ اگر ردیفی نبود همان `enrolment` اصلی می‌ماند.
 */
export function preferLatestEnrolments(
  semesters: readonly NestSemesterEnrolmentsByTerm[],
  rows: readonly NestStudentEnrollment[]
): NestSemesterEnrolmentsByTerm[] {
  const best = new Map<string, NestStudentEnrollment>();
  const time = (row: NestStudentEnrollment) =>
    new Date(row.createdAt ?? 0).getTime();
  for (const row of rows) {
    if (!row.semesterId || !row.lessonId) continue;
    if (!isNonCancelledEnrolment(row.status)) continue;
    const key = `${row.semesterId}:${row.lessonId}`;
    const prev = best.get(key);
    const rowActive = row.status === 'active';
    const prevActive = prev?.status === 'active';
    if (
      !prev ||
      (rowActive && !prevActive) ||
      (rowActive === prevActive && time(row) > time(prev))
    ) {
      best.set(key, row);
    }
  }
  if (best.size === 0) return [...semesters];

  return semesters.map((semester) => ({
    ...semester,
    lessons: (semester.lessons ?? []).map((lesson) => {
      const row = lesson.id ? best.get(`${semester.id}:${lesson.id}`) : undefined;
      return row ? { ...lesson, enrolment: row } : lesson;
    }),
  }));
}

/** یک ردیف تاریخچهٔ ثبت‌نام یک level خاص — از GET `by-semester`. */
export type EnrolmentHistoryEntry = {
  semesterId: string;
  lesson: NestSemesterLessonWithEnrolment;
  enrolment: NestStudentEnrollment;
};

/**
 * تاریخچهٔ کامل ثبت‌نام یک level خاص در طول زمان — همهٔ نیم‌سال‌هایی که
 * دانشجو در همان level (با همان kind) ثبت‌نام غیرکنسل‌شده داشته، نه فقط
 * نیم‌سال باز. چون `lessonId` بین ترم‌ها یکسان نیست (هر ترم درس‌های خودش را
 * می‌سازد)، تطبیق روی عنوان درس است، نه id.
 */
export function findEnrolmentHistoryForLevel(
  semesters: readonly NestSemesterEnrolmentsByTerm[],
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): EnrolmentHistoryEntry[] {
  const history: EnrolmentHistoryEntry[] = [];
  for (const semester of semesters) {
    const lesson = (semester.lessons ?? []).find((candidate) =>
      lessonMatchesLevel(candidate, kind, level)
    );
    if (lesson?.enrolment && isNonCancelledEnrolment(lesson.enrolment.status)) {
      history.push({ semesterId: semester.id, lesson, enrolment: lesson.enrolment });
    }
  }
  return history;
}

/**
 * آیا دانشجو تا حالا (در هر نیم‌سالی) هر نوع ثبت‌نامی — فعال، تکمیل‌شده، رد،
 * حتی کنسل‌شده توسط استاد/مدیر — برای این level داشته؟ برای قفل سایدبار:
 * سایدبار فقط درسی که مدیر ارشد همین الان باز کرده (`status: true`) را باز
 * نشان می‌دهد، *مگر* دانشجو قبلاً این level را گرفته باشد — چون آن‌وقت باید
 * بتواند برگردد و گزارش/تاریخچه‌اش را ببیند، فارغ از نتیجه یا اینکه الان
 * نوبتش هست یا نه. برخلاف `findEnrolmentHistoryForLevel`، کنسل‌شده را هم
 * می‌شمارد — برای «قبلاً باهاش کار داشته» بودن، کنسل‌شدن هم یک سابقه است.
 */
export function hasAnyEnrolmentForLevel(
  semesters: readonly NestSemesterEnrolmentsByTerm[],
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): boolean {
  return semesters.some((semester) => {
    const lesson = (semester.lessons ?? []).find((candidate) =>
      lessonMatchesLevel(candidate, kind, level)
    );
    return Boolean(lesson?.enrolment);
  });
}

/**
 * درسِ هم‌نوع دیگری (نه همین level) که دانشجو همین نیم‌سال ثبت‌نام
 * غیرکنسل‌شده دارد — برای S6 (بن‌بست اخذ چند level هم‌زمان تو یک ترم).
 */
export function findConflictLessonInSemester(
  semester: NestSemesterEnrolmentsByTerm | undefined,
  kind: InternshipCourseKind,
  currentLessonId: string | null
): NestSemesterLessonWithEnrolment | null {
  if (!semester) return null;
  return (
    (semester.lessons ?? []).find((lesson) => {
      if (!lesson.enrolment || !isNonCancelledEnrolment(lesson.enrolment.status)) {
        return false;
      }
      if (currentLessonId && lesson.id === currentLessonId) return false;
      return lessonMatchesKind(nestLessonTitle(lesson), kind);
    }) ?? null
  );
}
