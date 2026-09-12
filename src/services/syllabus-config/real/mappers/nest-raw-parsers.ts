import { extractApiMessage } from '@/services/api-error';
import type {
  NestAcademicSettings,
  NestLesson,
  NestLessonWeek,
  NestSemester,
  NestSemesterSeason,
  NestSemesterWithLessons,
} from '@/types/nest-admin';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSeason(value: unknown): value is NestSemesterSeason {
  return value === 'one' || value === 'two' || value === 'summer';
}

/** `_id.buffer` سند خام mongoose را به hex ۲۴ کاراکتری برمی‌گرداند. */
export function mongoBufferToHex(value: unknown): string {
  if (!isRecord(value)) return '';
  const bytes = Array.from({ length: 12 }, (_, index) => {
    const raw = value[String(index)];
    return typeof raw === 'number' ? raw : Number.NaN;
  });
  if (bytes.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)) {
    return '';
  }
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function nestIdFromUnknown(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (isRecord(value) && value.buffer !== undefined) {
    return mongoBufferToHex(value.buffer);
  }
  return '';
}

export function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(persianToEnglishDigits(value.trim()));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function unwrapNestDoc(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) return null;
  return isRecord(raw._doc) ? raw._doc : raw;
}

export function nestEntityId(row: { id?: string; _id?: string }): string {
  return row.id || row._id || '';
}

/** شناسهٔ Mongo در GET؛ پیش‌نویس محلی `week_…` است. */
export function isNestObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/** برچسب درس زنده ممکن است `title`، `name` یا `title_fa` باشد. */
export function nestLessonTitle(lesson: {
  title?: unknown;
  name?: unknown;
  title_fa?: unknown;
}): string {
  const candidates = [lesson.title, lesson.name, lesson.title_fa];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
    if (candidate && typeof candidate === 'object') {
      const rec = candidate as Record<string, unknown>;
      const nested = rec.title_fa ?? rec.fa ?? rec.title ?? rec.name;
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
  }
  return '';
}

/**
 * GET تمیز است؛ PATCH لایو گاهی سند mongoose (`$__` + `_doc` + `_id.buffer`) می‌دهد.
 * بعد از parse، `id` همیشه hex است.
 */
export function parseNestSemester(
  raw: unknown,
  fallbackId?: string
): NestSemester | null {
  if (!isRecord(raw)) return null;
  const doc = isRecord(raw._doc) ? raw._doc : raw;
  const id =
    nestIdFromUnknown(doc.id) ||
    nestIdFromUnknown(doc._id) ||
    (fallbackId ?? '');
  if (!id || !isSeason(doc.season)) return null;
  const structure =
    typeof doc.structure === 'string' && doc.structure
      ? doc.structure
      : 'semester';
  return {
    id,
    academicYear:
      typeof doc.academicYear === 'string' ? doc.academicYear : undefined,
    academicYears:
      typeof doc.academicYears === 'string' ? doc.academicYears : undefined,
    season: doc.season,
    structure: structure as NestSemester['structure'],
    courseSelection:
      typeof doc.courseSelection === 'boolean' ? doc.courseSelection : undefined,
    startClasses:
      typeof doc.startClasses === 'boolean' ? doc.startClasses : undefined,
    createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : undefined,
    updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : undefined,
  };
}

export function parseNestSemesterList(raw: unknown): NestSemester[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => parseNestSemester(row))
    .filter((row): row is NestSemester => row !== null);
}

export function parseNestSemesterBundle(
  raw: unknown
): NestSemesterWithLessons | null {
  const semester = parseNestSemester(raw);
  if (!semester || !isRecord(raw)) return null;
  const source = isRecord(raw._doc) ? raw._doc : raw;
  const lessons = Array.isArray(source.lessons)
    ? (source.lessons as NestLesson[])
    : [];
  return { ...semester, lessons };
}

/**
 * GET `/admin/settings` آخرین ردیف است؛ گاهی آرایه یا سند mongoose می‌آید.
 */
export function parseNestAcademicSettings(
  raw: unknown
): NestAcademicSettings | null {
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null;
    return parseNestAcademicSettings(raw[raw.length - 1]);
  }
  const doc = unwrapNestDoc(raw);
  if (!doc) return null;
  if (
    !('systemPassingScore' in doc) &&
    !('generalProfessorCapacity' in doc)
  ) {
    return null;
  }
  return {
    id: nestIdFromUnknown(doc.id) || nestIdFromUnknown(doc._id),
    systemPassingScore: asFiniteNumber(doc.systemPassingScore),
    generalProfessorCapacity: asFiniteNumber(doc.generalProfessorCapacity),
  };
}

/** GET `/admin/weeks/lesson/{id}` — `{ id, lessonId, priority, status }`. */
export function parseNestLessonWeek(raw: unknown): NestLessonWeek | null {
  const doc = unwrapNestDoc(raw);
  if (!doc) return null;
  const id = nestIdFromUnknown(doc.id) || nestIdFromUnknown(doc._id);
  const lessonId = nestIdFromUnknown(doc.lessonId);
  const priorityRaw = asFiniteNumber(doc.priority, Number.NaN);
  if (!id && !lessonId && !Number.isFinite(priorityRaw)) return null;
  return {
    id: id || undefined,
    lessonId: lessonId || undefined,
    priority: Number.isFinite(priorityRaw) ? priorityRaw : undefined,
    status: typeof doc.status === 'boolean' ? doc.status : undefined,
    title: typeof doc.title === 'string' ? doc.title : undefined,
  };
}

function unwrapWeekList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const doc = unwrapNestDoc(raw);
  if (!doc) return [];
  for (const key of ['weeks', 'data', 'items', 'result'] as const) {
    const value = doc[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function parseNestLessonWeekList(raw: unknown): NestLessonWeek[] {
  return unwrapWeekList(raw)
    .map(parseNestLessonWeek)
    .filter((week): week is NestLessonWeek => week !== null)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

function nestWeeksServerAlert(raw: unknown): string | null {
  if (Array.isArray(raw) || !isRecord(raw)) return null;
  const doc = unwrapNestDoc(raw);
  if (!doc) return null;
  const hasErrorField =
    doc.success === false ||
    doc.error !== undefined ||
    (Array.isArray(doc.errors) && doc.errors.length > 0);
  if (!hasErrorField) return null;
  return extractApiMessage(raw);
}

export type NestLessonWeeksGet = {
  weeks: NestLessonWeek[];
  isPublished: boolean;
  serverAlert: string | null;
};

/** پاسخ GET هفته‌های درس: آرایه، یا پاکت با `data`/`weeks` و خطاهای سرور. */
export function parseNestLessonWeeksGet(raw: unknown): NestLessonWeeksGet {
  const weeks = parseNestLessonWeekList(raw);
  return {
    weeks,
    isPublished: weeks.length > 0,
    serverAlert: nestWeeksServerAlert(raw),
  };
}
