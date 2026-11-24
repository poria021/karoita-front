import { toAcademicTerm } from '@/services/syllabus-config/real/mappers/term-mapping';
import type { UserRole } from '@/types/auth';
import type { NestSemester } from '@/types/nest-admin';

/**
 * نیم‌سال جاری میز کار.
 * - دانشجو: فقط نیم‌سال «ترمی»؛ مهارت‌آموز: فقط «پودمان».
 * - بقیهٔ پنل‌ها: هر دو.
 */
export type CurrentTermKind = 'semester' | 'podmani';

export const CURRENT_TERM_KIND_LABEL: Record<CurrentTermKind, string> = {
  semester: 'نیم‌سال ترمی',
  podmani: 'پودمان',
};

export type CurrentTermView = {
  kind: CurrentTermKind;
  kindLabel: string;
  /** عنوان نیم‌سال؛ `null` یعنی نیم‌سال بازی نیست. */
  title: string | null;
  /** گیت انتخاب واحد؛ `null` یعنی API گیت را نداده. */
  enrollOpen: boolean | null;
  /** گیت شروع کلاس‌ها؛ `null` یعنی API گیت را نداده. */
  classesStarted: boolean | null;
  /** تعداد درس‌های نیم‌سال (فقط وقتی API درس‌ها را می‌دهد). */
  lessonCount: number | null;
};

export function kindsForRole(role: UserRole): CurrentTermKind[] {
  if (role === 'student') return ['semester'];
  if (role === 'skill_learner') return ['podmani'];
  return ['semester', 'podmani'];
}

/** خواندن: `podmani` لایو و `modular` قدیمی هر دو پودمانی‌اند. */
export function semesterKind(semester: {
  structure?: string | null;
}): CurrentTermKind {
  return semester.structure === 'podmani' || semester.structure === 'modular'
    ? 'podmani'
    : 'semester';
}

/**
 * نیم‌سال جاری یک نوع: اول کلاس‌های در جریان، بعد انتخاب واحد باز.
 * اگر هیچ‌کدام از گیت‌ها در پاسخ نبود (API گیت نداده)، آخرین ردیف همان نوع.
 * اگر گیت‌ها آمده ولی همه بسته‌اند → `null`.
 */
function findLastOpen(
  items: readonly NestSemester[],
  predicate: (item: NestSemester) => boolean
): NestSemester | undefined {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item && predicate(item)) return item;
  }
  return undefined;
}

export function pickCurrentSemester(
  semesters: readonly NestSemester[],
  kind: CurrentTermKind
): NestSemester | null {
  const ofKind = semesters.filter((item) => semesterKind(item) === kind);
  // «آخرین» نیم‌سال باز: در real آخرین ردیف فهرست جدیدترین ترم است؛ اگر ترم
  // قدیمی هنوز بسته نشده باشد نباید جلوی ترم جدید را بگیرد.
  const running = findLastOpen(ofKind, (item) => item.startClasses === true);
  if (running) return running;
  const selecting = findLastOpen(ofKind, (item) => item.courseSelection === true);
  if (selecting) return selecting;
  const gatesKnown = ofKind.some(
    (item) =>
      typeof item.startClasses === 'boolean' ||
      typeof item.courseSelection === 'boolean'
  );
  return gatesKnown ? null : (ofKind[ofKind.length - 1] ?? null);
}

export function buildCurrentTermView(
  kind: CurrentTermKind,
  semester: NestSemester | null,
  lessonCount: number | null = null
): CurrentTermView {
  const base = { kind, kindLabel: CURRENT_TERM_KIND_LABEL[kind] };
  if (!semester) {
    return {
      ...base,
      title: null,
      enrollOpen: null,
      classesStarted: null,
      lessonCount: null,
    };
  }
  return {
    ...base,
    title: toAcademicTerm(semester).title || null,
    enrollOpen:
      typeof semester.courseSelection === 'boolean'
        ? semester.courseSelection
        : null,
    classesStarted:
      typeof semester.startClasses === 'boolean'
        ? semester.startClasses
        : null,
    lessonCount,
  };
}

export type CurrentTermStatus = 'running' | 'selecting' | 'closed' | 'unknown';

/**
 * وضعیت کلی برای چیپ تایل: کلاس‌ها در جریان > انتخاب واحد > بسته.
 * وقتی API هیچ گیتی نداده، `unknown` (چیپ نشان داده نمی‌شود، نه «بسته»).
 */
export function currentTermStatus(view: CurrentTermView): CurrentTermStatus {
  if (view.title === null) return 'closed';
  if (view.classesStarted === null && view.enrollOpen === null) return 'unknown';
  if (view.classesStarted === true) return 'running';
  if (view.enrollOpen === true) return 'selecting';
  return 'closed';
}
