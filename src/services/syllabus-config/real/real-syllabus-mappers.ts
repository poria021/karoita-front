import { extractApiMessage } from '@/services/api-error';
import { DEFAULT_WEEK_WEIGHT } from '@/services/syllabus-config/syllabus-term-gates';
import type {
  NestAcademicSettings,
  NestCreateSemesterDto,
  NestCreateWeekDto,
  NestLesson,
  NestLessonWeek,
  NestPutLessonWeeksDto,
  NestSemester,
  NestSemesterAllStructure,
  NestSemesterSeason,
  NestSemesterWithLessons,
  NestUpdateWeekDto,
} from '@/types/nest-admin';
import type {
  AcademicTerm,
  AcademicTermType,
  CourseCatalogItem,
  CourseOfferingKind,
  CourseOfferingListItem,
  CourseOfferingRecord,
  SyllabusWeek,
  UpsertTermInput,
} from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/** Nest `priority` همان ضریب اهمیت UI است؛ فقط ۱…۵. شماره هفته ایندکس آرایه است. */
const NEST_WEEK_PRIORITY_MIN = 1;
const NEST_WEEK_PRIORITY_MAX = 5;

function nestPriorityFromWeight(
  weight: number,
  fallback: number = DEFAULT_WEEK_WEIGHT
): number {
  if (
    Number.isInteger(weight) &&
    weight >= NEST_WEEK_PRIORITY_MIN &&
    weight <= NEST_WEEK_PRIORITY_MAX
  ) {
    return weight;
  }
  if (
    Number.isInteger(fallback) &&
    fallback >= NEST_WEEK_PRIORITY_MIN &&
    fallback <= NEST_WEEK_PRIORITY_MAX
  ) {
    return fallback;
  }
  return DEFAULT_WEEK_WEIGHT;
}

/**
 * ترم Nest فیلد پیشوند جدا ندارد — `season` + `structure` همان است.
 * این لیترال‌ها باید با `SEMESTER_PREFIX_OPTIONS` / `MODULAR_PREFIX_OPTIONS`
 * در فیچر سرفصل هم‌خوان بمانند (سرویس نباید از لایهٔ فیچر import کند).
 */
const SEMESTER_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'نیم‌سال اول',
  two: 'نیم‌سال دوم',
  summer: 'تابستان',
};

const MODULAR_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'پودمان اول',
  two: 'پودمان دوم',
  // فرم پودمانی تابستان ندارد — به دوم برمی‌گردیم.
  summer: 'پودمان دوم',
};

export function nestEntityId(row: { id?: string; _id?: string }): string {
  return row.id || row._id || '';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSeason(value: unknown): value is NestSemesterSeason {
  return value === 'one' || value === 'two' || value === 'summer';
}

/** `_id.buffer` سند خام mongoose را به hex ۲۴ کاراکتری برمی‌گرداند. */
function mongoBufferToHex(value: unknown): string {
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

function nestIdFromUnknown(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (isRecord(value) && value.buffer !== undefined) {
    return mongoBufferToHex(value.buffer);
  }
  return '';
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(persianToEnglishDigits(value.trim()));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function unwrapNestDoc(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) return null;
  return isRecord(raw._doc) ? raw._doc : raw;
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

/**
 * سال تحصیلی لایو مخلوط است (`۱۴۰۵-۱۴۰۶`، `1405-1407`، `۱۴۰۵ -۱۴۰7`).
 * state فرم و payload نوشتن همیشه `YYYY-YYYY` انگلیسی است.
 */
export function normalizeAcademicYear(raw: string): string {
  return persianToEnglishDigits(raw)
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '');
}

/**
 * خواندن: `podmani` لایو و `modular` ردیف قدیمی هر دو پودمانی‌اند.
 * نوشتن فقط `toNestSemesterStructure` — هرگز `modular` نفرست.
 */
export function toAcademicTermType(structure: string): AcademicTermType {
  return structure === 'podmani' || structure === 'modular'
    ? 'modular'
    : 'semester';
}

/** `structure` برای POST/PATCH و کوئری `semesters_all`. */
export function toNestSemesterStructure(
  type: AcademicTermType
): NestSemesterAllStructure {
  return type === 'modular' ? 'podmani' : 'semester';
}

export function toNestSemesterAllStructure(
  type: AcademicTermType
): NestSemesterAllStructure {
  return toNestSemesterStructure(type);
}

export function catalogKindForTermType(
  type: AcademicTermType
): CourseOfferingKind {
  return type === 'modular' ? 'apprenticeship' : 'internship';
}

function prefixForSeason(
  structure: AcademicTermType,
  season: NestSemesterSeason
): string {
  const table =
    structure === 'modular' ? MODULAR_SEASON_PREFIXES : SEMESTER_SEASON_PREFIXES;
  return table[season];
}

/** معکوس `prefixForSeason` برای بدنهٔ create/update. */
export function seasonForPrefix(
  structure: AcademicTermType,
  titlePrefix: string
): NestSemesterSeason {
  const table =
    structure === 'modular' ? MODULAR_SEASON_PREFIXES : SEMESTER_SEASON_PREFIXES;
  const match = (Object.keys(table) as NestSemesterSeason[]).find(
    (season) => table[season] === titlePrefix
  );
  return match ?? 'one';
}

function semesterYear(semester: NestSemester): string {
  return normalizeAcademicYear(
    semester.academicYears ?? semester.academicYear ?? ''
  );
}

function weekLabel(weekNumber: number, title?: string): string {
  const trimmed = title?.trim();
  return trimmed || `هفته ${weekNumber}`;
}

/**
 * `Semester` Nest → `AcademicTerm`.
 * گیت روی خود ترم است؛ درس فقط fallback برای کپی قدیمی Nest.
 * اگر پرچم روشن باشد و تاریخ شروع نیاید، `todayJalali` می‌گذاریم تا `isTermGateActive` روشن بماند.
 */
export function toAcademicTerm(
  semester: NestSemester,
  options?: { lessons?: NestLesson[]; todayJalali?: string }
): AcademicTerm {
  const type = toAcademicTermType(semester.structure);
  const prefix = prefixForSeason(type, semester.season);
  const year = semesterYear(semester);
  const title = `${prefix} ${year}`.trim();
  const lessons = options?.lessons ?? [];
  const isEnrollOpen =
    semester.courseSelection === true ||
    lessons.some((lesson) => lesson.courseSelection === true);
  const isTermOpen =
    semester.startClasses === true ||
    lessons.some((lesson) => lesson.startClasses === true);
  const today = options?.todayJalali ?? '';
  return {
    id: nestEntityId(semester) || semester.id,
    title,
    type,
    titlePrefix: prefix,
    academicYear: year,
    isEnrollOpen,
    isTermOpen,
    enrollStart: isEnrollOpen ? today : '',
    termStart: isTermOpen ? today : '',
  };
}

export function toCourseCatalogItem(
  lesson: NestLesson,
  termType: AcademicTermType
): CourseCatalogItem | null {
  const id = nestEntityId(lesson);
  if (!id) return null;
  return {
    id,
    title: nestLessonTitle(lesson),
    type: catalogKindForTermType(termType),
  };
}

export function toCourseOfferingListItem(
  lesson: NestLesson,
  termType: AcademicTermType
): CourseOfferingListItem | null {
  const catalog = toCourseCatalogItem(lesson, termType);
  if (!catalog) return null;
  return {
    courseOfferingId: catalog.id,
    courseCatalogId: catalog.id,
    title: catalog.title,
    type: catalog.type,
    isOffered: lesson.status === true,
  };
}

export function toSyllabusWeek(
  week: NestLessonWeek,
  index: number,
  defaultWeight: number
): SyllabusWeek {
  const weekNumber = index + 1;
  const label = weekLabel(weekNumber, week.title);
  return {
    id: nestEntityId(week) || `week_index_${weekNumber}`,
    suffix: label,
    title: label,
    weight: nestPriorityFromWeight(week.priority ?? Number.NaN, defaultWeight),
    status: week.status === false ? 'archived' : 'active',
  };
}

export function toCourseOfferingRecord(
  termId: string,
  lesson: NestLesson,
  defaultWeight: number,
  termType: AcademicTermType
): CourseOfferingRecord | null {
  const lessonId = nestEntityId(lesson);
  if (!lessonId) return null;
  return {
    id: lessonId,
    termId,
    courseCatalogId: lessonId,
    title: nestLessonTitle(lesson),
    type: catalogKindForTermType(termType),
    isOffered: lesson.status === true,
    weeks: (lesson.weeks ?? []).map((week, index) =>
      toSyllabusWeek(week, index, defaultWeight)
    ),
  };
}

export function toNestLessonWeeksBody(weeks: SyllabusWeek[]): NestPutLessonWeeksDto {
  return {
    weeks: weeks.map((week) => ({
      priority: nestPriorityFromWeight(week.weight),
      status: week.status === 'active',
    })),
  };
}

export type NestWeekWritePlan = {
  creates: NestCreateWeekDto[];
  updates: Array<{ id: string; body: NestUpdateWeekDto }>;
  /** هفته‌ای که از ادیتور حذف شده — `DELETE /admin/weeks/{id}`. */
  deletions: string[];
};

function remoteIsActive(week: NestLessonWeek): boolean {
  return week.status !== false;
}

function patchBody(
  lessonId: string,
  priority: number,
  status: boolean
): NestUpdateWeekDto {
  return { lessonId, priority, status };
}

/**
 * پیکربندی اول (GET خالی): فقط `POST`.
 * بعد از ثبت، GET هفته دارد: هفته‌های محلی جدید هم `POST` می‌شوند (افزودن مجاز است)،
 * ولی هفته‌های ثبت‌شده حذف نمی‌شوند — فقط `PATCH` (بایگانی/بازیابی) روی آن‌ها اعمال می‌شود.
 */
export function planNestWeekWrites(
  lessonId: string,
  weeks: SyllabusWeek[],
  remote: NestLessonWeek[]
): NestWeekWritePlan {
  const remoteById = new Map(
    remote
      .map((week) => [nestEntityId(week), week] as const)
      .filter(([id]) => Boolean(id))
  );
  const used = new Set<string>();
  const creates: NestCreateWeekDto[] = [];
  const updates: Array<{ id: string; body: NestUpdateWeekDto }> = [];
  const deletions: string[] = [];

  function queueUpdate(
    id: string,
    priority: number,
    status: boolean
  ) {
    used.add(id);
    const current = remoteById.get(id);
    if (
      current &&
      (current.priority ?? 0) === priority &&
      remoteIsActive(current) === status
    ) {
      return;
    }
    updates.push({ id, body: patchBody(lessonId, priority, status) });
  }

  weeks.forEach((week, index) => {
    const priority = nestPriorityFromWeight(week.weight);
    const status = week.status === 'active';
    if (isNestObjectId(week.id) && remoteById.has(week.id)) {
      queueUpdate(week.id, priority, status);
      return;
    }

    const remoteAtIndexId = nestEntityId(remote[index] ?? {});
    if (remoteAtIndexId && !used.has(remoteAtIndexId)) {
      queueUpdate(remoteAtIndexId, priority, status);
      return;
    }

    if (isNestObjectId(week.id)) {
      queueUpdate(week.id, priority, status);
      return;
    }

    creates.push({ lessonId, priority, status });
  });

  for (const [id] of remoteById) {
    if (used.has(id)) continue;
    deletions.push(id);
  }

  if (remote.length > 0) {
    return { creates, updates, deletions: [] };
  }

  return { creates, updates, deletions };
}

export function mergeTermsWithLessonBundles(
  listed: AcademicTerm[],
  bundles: NestSemesterWithLessons[],
  todayJalali: string,
  defaultWeight: number
): {
  terms: AcademicTerm[];
  offerings: Record<string, CourseOfferingRecord>;
} {
  const byId = new Map<string, AcademicTerm>();
  for (const term of listed) {
    byId.set(term.id, term);
  }

  const offerings: Record<string, CourseOfferingRecord> = {};
  for (const bundle of bundles) {
    const listedTerm = byId.get(bundle.id);
    const mapped = toAcademicTerm(bundle, {
      lessons: bundle.lessons,
      todayJalali,
    });
    // GET /admin/semester منبع گیت است؛ semesters_all معمولاً courseSelection/startClasses ندارد.
    byId.set(
      bundle.id,
      listedTerm
        ? {
            ...mapped,
            isEnrollOpen: listedTerm.isEnrollOpen || mapped.isEnrollOpen,
            isTermOpen: listedTerm.isTermOpen || mapped.isTermOpen,
            enrollStart:
              listedTerm.isEnrollOpen || mapped.isEnrollOpen
                ? listedTerm.enrollStart || mapped.enrollStart
                : '',
            termStart:
              listedTerm.isTermOpen || mapped.isTermOpen
                ? listedTerm.termStart || mapped.termStart
                : '',
          }
        : mapped
    );
    for (const lesson of bundle.lessons ?? []) {
      const record = toCourseOfferingRecord(
        bundle.id,
        lesson,
        defaultWeight,
        toAcademicTermType(bundle.structure)
      );
      if (record) offerings[record.id] = record;
    }
  }

  return { terms: [...byId.values()], offerings };
}

export function lessonsOfTerm(
  bundles: NestSemesterWithLessons[],
  termId: string
): { termType: AcademicTermType; lessons: NestLesson[] } | null {
  const bundle = bundles.find((row) => row.id === termId);
  if (!bundle) return null;
  return {
    termType: toAcademicTermType(bundle.structure),
    lessons: bundle.lessons ?? [],
  };
}

/** فرم تنظیمات ترم → بدنهٔ create/update Nest. گیت پیش‌فرض بسته است مگر ردیف زنده بدهی. */
export function toNestSemesterDto(
  input: UpsertTermInput,
  current?: Pick<NestSemester, 'courseSelection' | 'startClasses'>
): NestCreateSemesterDto {
  return {
    season: seasonForPrefix(input.type, input.titlePrefix),
    structure: toNestSemesterStructure(input.type),
    academicYear: normalizeAcademicYear(input.academicYear),
    courseSelection: current?.courseSelection ?? false,
    startClasses: current?.startClasses ?? false,
  };
}

/**
 * PATCH ترم باید season/structure/academicYear را هم بفرستد؛
 * فقط گیت فرستادن فیلد هویت را خالی می‌کند. `structure` همیشه `podmani`/`semester`.
 */
export function toNestSemesterWriteDto(
  current: NestSemester,
  patch: Partial<
    Pick<
      NestCreateSemesterDto,
      'season' | 'structure' | 'academicYear' | 'courseSelection' | 'startClasses'
    >
  > = {}
): NestCreateSemesterDto {
  return {
    season: patch.season ?? current.season,
    structure:
      patch.structure ??
      toNestSemesterStructure(toAcademicTermType(current.structure)),
    academicYear:
      patch.academicYear ??
      current.academicYear ??
      current.academicYears ??
      '',
    courseSelection: patch.courseSelection ?? current.courseSelection ?? false,
    startClasses: patch.startClasses ?? current.startClasses ?? false,
  };
}

export type RealAcademicSettings = {
  globalProfessorCapacity: number;
  passingScoreThreshold: number;
};

/** `AcademicSettings` Nest → شکل تنظیمات محلی. */
export function toAcademicSettings(
  settings: NestAcademicSettings
): RealAcademicSettings {
  return {
    globalProfessorCapacity: asFiniteNumber(settings.generalProfessorCapacity),
    passingScoreThreshold: asFiniteNumber(settings.systemPassingScore),
  };
}
