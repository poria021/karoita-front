import type {
  NestAcademicSettings,
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
 * Nest's semester model has no prefix/label field of its own — `season` +
 * `structure` encode it instead. These literals must stay in sync with
 * SEMESTER_PREFIX_OPTIONS / MODULAR_PREFIX_OPTIONS in
 * `src/features/karvita/syllabus-config/constants.ts` (services must not
 * import feature-layer constants — see rule 00, #4/#13).
 */
const SEMESTER_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'نیم‌سال اول',
  two: 'نیم‌سال دوم',
  three: 'تابستان',
};

const MODULAR_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'پودمان اول',
  two: 'پودمان دوم',
  // Modular terms have no summer season in the form — fall back to دوم.
  three: 'پودمان دوم',
};

export function nestEntityId(row: { id?: string; _id?: string }): string {
  return row.id || row._id || '';
}

/** Nest Mongo ids on GET rows; local draft weeks use `week_…`. */
export function isNestObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/** Lesson label — live rows may send `title`, `name`, or `title_fa`. */
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
 * GET `/admin/semesters_all` uses `podmani` for modular terms (live), while
 * POST `/admin/semester` still writes `structure: modular`.
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

/** Inverse of prefixForSeason — used when building the create/update body. */
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
 * Nest Semester → AcademicTerm.
 * Gate flags are lesson-level on `/semesters_all` — pass `lessons` to overlay
 * them. When a flag is on and Nest sends no start date, `todayJalali` is used
 * so the existing `isTermGateActive(isOpen, startDate)` helper still lights up.
 */
export function toAcademicTerm(
  semester: NestSemester,
  options?: { lessons?: NestLesson[]; todayJalali?: string }
): AcademicTerm {
  const type = toAcademicTermType(semester.structure);
  const prefix = prefixForSeason(type, semester.season);
  const title = `${prefix} ${persianToEnglishDigits(semesterYear(semester))}`.trim();
  const lessons = options?.lessons ?? [];
  const isEnrollOpen = lessons.some((lesson) => lesson.courseSelection === true);
  const isTermOpen = lessons.some((lesson) => lesson.startClasses === true);
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
 * POST /admin/weeks for new rows, PATCH /admin/weeks/{id} for existing.
 * Remote weeks dropped from the editor are archived (`status: false`) —
 * Nest has no week DELETE in this batch.
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
    byId.set(
      bundle.id,
      toAcademicTerm(bundle, { lessons: bundle.lessons, todayJalali })
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

/** UpsertTermInput (term-settings form) → Nest create body. */
export function toNestSemesterDto(input: UpsertTermInput): {
  season: NestSemesterSeason;
  structure: AcademicTermType;
  academicYear: string;
} {
  return {
    season: seasonForPrefix(input.type, input.titlePrefix),
    structure: input.type,
    academicYear: persianToEnglishDigits(input.academicYear),
  };
}

export type RealAcademicSettings = {
  globalProfessorCapacity: number;
  passingScoreThreshold: number;
};

/** Nest AcademicSettings → local settings shape. */
export function toAcademicSettings(
  settings: NestAcademicSettings
): RealAcademicSettings {
  return {
    globalProfessorCapacity: settings.generalProfessorCapacity,
    passingScoreThreshold: settings.systemPassingScore,
  };
}
