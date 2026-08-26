import type {
  NestAcademicSettings,
  NestSemester,
  NestSemesterSeason,
} from '@/types/nest-admin';
import type {
  AcademicTerm,
  AcademicTermType,
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

/**
 * Nest Semester → AcademicTerm. `structure` maps 1:1 to AcademicTermType.
 * Enroll/term gates aren't part of the Nest semester model yet — real
 * terms always come back closed (see NestSemester doc comment).
 */
export function toAcademicTerm(semester: NestSemester): AcademicTerm {
  const prefix = prefixForSeason(semester.structure, semester.season);
  const title =
    `${prefix} ${persianToEnglishDigits(semester.academicYear)}`.trim();
  return {
    id: semester.id,
    title,
    type: semester.structure,
    isEnrollOpen: false,
    isTermOpen: false,
    enrollStart: '',
    termStart: '',
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
