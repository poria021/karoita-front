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

/**
 * ترم Nest فیلد پیشوند جدا ندارد — `season` + `structure` همان است.
 * این لیترال‌ها باید با `SEMESTER_PREFIX_OPTIONS` / `MODULAR_PREFIX_OPTIONS`
 * در فیچر سرفصل هم‌خوان بمانند (سرویس نباید از لایهٔ فیچر import کند).
 */
const SEMESTER_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'نیم‌سال اول',
  two: 'نیم‌سال دوم',
  three: 'تابستان',
};

const MODULAR_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'پودمان اول',
  two: 'پودمان دوم',
  // فرم پودمانی تابستان ندارد — به دوم برمی‌گردیم.
  three: 'پودمان دوم',
};

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
 * `GET /admin/semesters_all` پودمانی را `podmani` می‌فرستد؛
 * `POST /admin/semester` هنوز `structure: modular` می‌نویسد.
 */
export function toAcademicTermType(structure: string): AcademicTermType {
  return structure === 'podmani' || structure === 'modular'
    ? 'modular'
    : 'semester';
}

export function toNestSemesterAllStructure(
  type: AcademicTermType
): NestSemesterAllStructure {
  return type === 'modular' ? 'podmani' : 'semester';
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
  return semester.academicYears ?? semester.academicYear ?? '';
}

function weekLabel(priority: number, title?: string): string {
  const trimmed = title?.trim();
  return trimmed || `هفته ${priority}`;
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
  const title = `${prefix} ${persianToEnglishDigits(semesterYear(semester))}`.trim();
  const lessons = options?.lessons ?? [];
  const isEnrollOpen =
    semester.courseSelection === true ||
    lessons.some((lesson) => lesson.courseSelection === true);
  const isTermOpen =
    semester.startClasses === true ||
    lessons.some((lesson) => lesson.startClasses === true);
  const today = options?.todayJalali ?? '';
  return {
    id: semester.id,
    title,
    type,
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
  const priority = week.priority ?? index + 1;
  const label = weekLabel(priority, week.title);
  return {
    id: nestEntityId(week) || `week_priority_${priority}`,
    suffix: label,
    title: label,
    weight: defaultWeight,
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
    weeks: weeks.map((week, index) => ({
      priority: index + 1,
      status: week.status === 'active',
    })),
  };
}

export type NestWeekWritePlan = {
  creates: NestCreateWeekDto[];
  updates: Array<{ id: string; body: NestUpdateWeekDto }>;
};

/**
 * ردیف جدید `POST /admin/weeks`؛ موجود `PATCH /admin/weeks/{id}`.
 * هفتهٔ حذف‌شده از ادیتور با `status: false` بایگانی می‌شود — Nest در این دسته DELETE هفته ندارد.
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

  weeks.forEach((week, index) => {
    const priority = index + 1;
    const status = week.status === 'active';
    if (isNestObjectId(week.id)) {
      used.add(week.id);
      updates.push({
        id: week.id,
        body: { lessonId, priority, status },
      });
      return;
    }
    creates.push({ lessonId, priority, status });
  });

  for (const [id, week] of remoteById) {
    if (used.has(id)) continue;
    updates.push({
      id,
      body: {
        lessonId,
        priority: week.priority ?? 99,
        status: false,
      },
    });
  }

  return { creates, updates };
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
    structure: input.type,
    academicYear: persianToEnglishDigits(input.academicYear),
    courseSelection: current?.courseSelection ?? false,
    startClasses: current?.startClasses ?? false,
  };
}

/**
 * PATCH ترم باید season/structure/academicYear را هم بفرستد؛
 * فقط گیت فرستادن فیلد هویت را خالی می‌کند.
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
    structure: patch.structure ?? toAcademicTermType(current.structure),
    academicYear:
      patch.academicYear ?? current.academicYear ?? current.academicYears ?? '',
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
    globalProfessorCapacity: settings.generalProfessorCapacity,
    passingScoreThreshold: settings.systemPassingScore,
  };
}
