import type {
  NestLesson,
  NestProfessorCapacity,
  NestProfessorCapacityWriteDto,
  NestSemesterAllStructure,
  NestSemesterSeason,
  NestSemesterWithLessons,
} from '@/types/nest-admin';
import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCourse,
  OrganizationalCapacityKind,
  OrganizationalCapacityWeekday,
} from '@/types/organizational-capacities';
import { lessonLevelFromTitle } from '@/utils/lessonLevelFromTitle';
import { summarizeCapacityCourses } from '@/utils/organizational-capacity-math';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export { lessonLevelFromTitle } from '@/utils/lessonLevelFromTitle';

const WEEKDAYS: readonly OrganizationalCapacityWeekday[] = [
  'sat',
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
];

const SEMESTER_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'نیم‌سال اول',
  two: 'نیم‌سال دوم',
  summer: 'تابستان',
};

const MODULAR_SEASON_PREFIXES: Record<NestSemesterSeason, string> = {
  one: 'پودمان اول',
  two: 'پودمان دوم',
  summer: 'پودمان دوم',
};

/** کارورزی → `GET semesters_all?structure=semester`؛ کارآموزی → `podmani`. */
export function nestStructureForCapacityKind(
  kind: OrganizationalCapacityKind
): NestSemesterAllStructure {
  return kind === 'internship' ? 'semester' : 'podmani';
}

export function nestEntityId(row: { id?: string; _id?: string }): string {
  return row.id || row._id || '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSeason(value: unknown): value is NestSemesterSeason {
  return value === 'one' || value === 'two' || value === 'summer';
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(persianToEnglishDigits(value));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

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
  }
  return '';
}

export function nestDayIndexToWeekday(
  day: number
): OrganizationalCapacityWeekday | null {
  return WEEKDAYS[day] ?? null;
}

export function weekdayToNestDayIndex(
  day: OrganizationalCapacityWeekday
): number {
  return WEEKDAYS.indexOf(day);
}

export function nestDaysToSelectedDays(
  days: number[] | undefined
): OrganizationalCapacityWeekday[] {
  if (!days?.length) return [];
  const unique: OrganizationalCapacityWeekday[] = [];
  for (const raw of days) {
    if (!Number.isInteger(raw) || raw < 0 || raw > 5) continue;
    const weekday = nestDayIndexToWeekday(raw);
    if (weekday && !unique.includes(weekday)) unique.push(weekday);
  }
  // UI استاد راهنما یک روز است — اولین روز معتبر لایو.
  return unique.slice(0, 1);
}

export function selectedDaysToNestDays(
  days: OrganizationalCapacityWeekday[]
): number[] {
  const indexes = days
    .map((day) => weekdayToNestDayIndex(day))
    .filter((index) => index >= 0);
  return [...new Set(indexes)].slice(0, 1);
}

export function termTitleFromBundle(bundle: NestSemesterWithLessons): string {
  const type =
    bundle.structure === 'podmani' || bundle.structure === 'modular'
      ? 'modular'
      : 'semester';
  const table =
    type === 'modular' ? MODULAR_SEASON_PREFIXES : SEMESTER_SEASON_PREFIXES;
  const season = isSeason(bundle.season) ? bundle.season : 'one';
  const year = persianToEnglishDigits(
    (bundle.academicYears ?? bundle.academicYear ?? '').trim()
  )
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '');
  return `${table[season]} ${year}`.trim();
}

export function parseNestSemesterBundle(
  raw: unknown
): NestSemesterWithLessons | null {
  if (!isRecord(raw)) return null;
  const doc = isRecord(raw._doc) ? raw._doc : raw;
  const id =
    (typeof doc.id === 'string' && doc.id) ||
    (typeof doc._id === 'string' && doc._id) ||
    '';
  if (!id || !isSeason(doc.season)) return null;
  const structure =
    typeof doc.structure === 'string' && doc.structure
      ? doc.structure
      : 'semester';
  const lessons = Array.isArray(doc.lessons)
    ? (doc.lessons as NestLesson[])
    : [];
  return {
    id,
    academicYear:
      typeof doc.academicYear === 'string' ? doc.academicYear : undefined,
    academicYears:
      typeof doc.academicYears === 'string' ? doc.academicYears : undefined,
    season: doc.season,
    structure: structure as NestSemesterWithLessons['structure'],
    lessons,
  };
}

export function parseNestProfessorCapacity(
  raw: unknown
): NestProfessorCapacity | null {
  if (!isRecord(raw)) return null;
  const doc = isRecord(raw._doc) ? raw._doc : raw;
  const professorId =
    typeof doc.professorId === 'string' ? doc.professorId : '';
  const lessonId = typeof doc.lessonId === 'string' ? doc.lessonId : '';
  const semesterId =
    typeof doc.semesterId === 'string' ? doc.semesterId : '';
  if (!professorId || !lessonId || !semesterId) return null;
  const days = Array.isArray(doc.days)
    ? doc.days.filter((day): day is number => Number.isInteger(day))
    : [];
  return {
    id:
      (typeof doc.id === 'string' && doc.id) ||
      (typeof doc._id === 'string' && doc._id) ||
      undefined,
    professorId,
    lessonId,
    semesterId,
    days,
    capacity: asFiniteNumber(doc.capacity, Number.NaN),
  };
}

export function parseNestProfessorCapacityList(
  raw: unknown
): NestProfessorCapacity[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => parseNestProfessorCapacity(row))
    .filter((row): row is NestProfessorCapacity => row !== null);
}

export function parseGeneralProfessorCapacity(raw: unknown): number {
  const source = Array.isArray(raw) ? raw[raw.length - 1] : raw;
  if (!isRecord(source)) return 15;
  const doc = isRecord(source._doc) ? source._doc : source;
  const value = asFiniteNumber(doc.generalProfessorCapacity, Number.NaN);
  if (!Number.isFinite(value) || value <= 0) return 15;
  return value;
}

export function toCapacityCourseFromLesson(input: {
  lesson: NestLesson;
  kind: OrganizationalCapacityKind;
  maxCapacity: number;
  row: NestProfessorCapacity | null;
}): OrganizationalCapacityCourse {
  const title = nestLessonTitle(input.lesson);
  const lessonId = nestEntityId(input.lesson);
  const existsOnServer = input.row != null;
  // GET خالی = استاد هنوز تعیین نکرده؛ درس را پر نکن — ظرفیت ۰ و هفته خالی.
  const rawCapacity = existsOnServer
    ? asFiniteNumber(input.row?.capacity, Number.NaN)
    : Number.NaN;
  const total = existsOnServer
    ? Number.isFinite(rawCapacity)
      ? Math.min(Math.max(0, rawCapacity), input.maxCapacity)
      : 0
    : 0;
  const selectedDays = existsOnServer
    ? nestDaysToSelectedDays(input.row?.days)
    : [];
  return {
    id: lessonId,
    title: title || 'درس',
    kind: input.kind,
    level: lessonLevelFromTitle(title),
    total,
    confirmed: 0,
    selectedDays,
    existsOnServer,
  };
}

export function toWriteDto(input: {
  professorId: string;
  semesterId: string;
  course: OrganizationalCapacityCourse;
  maxCapacity: number;
}): NestProfessorCapacityWriteDto {
  const capacity = Math.min(
    Math.max(0, input.course.total ?? 0),
    input.maxCapacity
  );
  return {
    professorId: input.professorId,
    lessonId: input.course.id,
    semesterId: input.semesterId,
    days: selectedDaysToNestDays(input.course.selectedDays),
    capacity,
  };
}

export function toSnapshot(input: {
  kind: OrganizationalCapacityKind;
  termId: string;
  termTitle: string;
  maxCapacity: number;
  courses: OrganizationalCapacityCourse[];
  terms: Array<{ id: string; title: string }>;
}): OrganizationalCapacitiesSnapshot {
  return {
    termId: input.termId,
    termTitle: input.termTitle,
    kind: input.kind,
    maxCapacity: input.maxCapacity,
    status: 'draft',
    courses: input.courses,
    summary: summarizeCapacityCourses(input.courses),
    terms: input.terms,
  };
}
