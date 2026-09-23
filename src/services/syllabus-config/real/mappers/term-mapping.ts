import type {
  NestAcademicSettings,
  NestCreateSemesterDto,
  NestLesson,
  NestSemester,
  NestSemesterAllStructure,
  NestSemesterSeason,
} from '@/types/nest-admin';
import type { AcademicTerm, AcademicTermType, CourseOfferingKind, UpsertTermInput } from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import { asFiniteNumber, nestEntityId } from './nest-raw-parsers';

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
