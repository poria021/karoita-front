import type {
  AcademicTerm,
  CourseOfferingKind,
  CourseOfferingRecord,
  SyllabusConfigSnapshot,
  SyllabusWeek,
  UpsertTermInput,
} from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import {
  buildCourseOfferingId,
  findCatalogById,
  getCatalogForTermType,
} from '../syllabus-mappers';
import {
  cloneDefaultCourseDefinitions,
  courseDefinitionsOf,
} from '../course-catalog';
import { DEFAULT_WEEK_WEIGHT } from '../syllabus-term-gates';

export const INTERNSHIP_DEFAULT_WEEKS = 16;
export const APPRENTICESHIP_DEFAULT_WEEKS = 8;

export function defaultWeekCount(kind: CourseOfferingKind): number {
  return kind === 'apprenticeship'
    ? APPRENTICESHIP_DEFAULT_WEEKS
    : INTERNSHIP_DEFAULT_WEEKS;
}

export function buildSeedWeeks(
  count: number,
  status: SyllabusWeek['status'],
  idPrefix = 'week'
): SyllabusWeek[] {
  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    const label = `هفته ${n}`;
    return {
      id: `${idPrefix}_${n}`,
      suffix: label,
      title: label,
      weight: DEFAULT_WEEK_WEIGHT,
      status,
    };
  });
}

/** ترم‌های ثابت mock — ثبت‌نام و ترم جاری باز است تا صفحات داده داشته باشند. */
const TERMS: AcademicTerm[] = [
  {
    id: 'term_1',
    title: 'نیم‌سال اول 1404-1405',
    type: 'semester',
    isEnrollOpen: false,
    isTermOpen: false,
    enrollStart: '',
    termStart: '',
  },
  {
    id: 'term_2',
    title: 'نیم‌سال اول 1405-1406',
    type: 'semester',
    isEnrollOpen: true,
    isTermOpen: true,
    enrollStart: '1400/01/01',
    termStart: '1400/01/01',
  },
  {
    id: 'term_modular_1',
    title: 'دوره مهارتی 1405-1406',
    type: 'modular',
    isEnrollOpen: true,
    isTermOpen: true,
    enrollStart: '1400/01/01',
    termStart: '1400/01/01',
  },
];

/** داده‌ی ثابت حالت mock — هیچ state یا ذخیره‌سازی‌ای ندارد. */
export function mockSyllabusSnapshot(): SyllabusConfigSnapshot {
  const courseCatalog = cloneDefaultCourseDefinitions();
  const offerings: Record<string, CourseOfferingRecord> = {};
  for (const term of TERMS.filter((t) => t.id !== 'term_1')) {
    for (const course of getCatalogForTermType(term.type, courseCatalog)) {
      const id = buildCourseOfferingId(term.id, course.id);
      offerings[id] = {
        id,
        termId: term.id,
        courseCatalogId: course.id,
        isOffered: true,
        weeks: buildSeedWeeks(defaultWeekCount(course.type), 'active', id),
      };
    }
  }
  return {
    terms: structuredClone(TERMS),
    offerings,
    internships: [],
    globalProfessorCapacity: 15,
    passingScoreThreshold: 70,
    courseCatalog,
  };
}

/** هفته‌های یک درس؛ اگر ثبت نشده باشد هفته‌های پیش‌فرض فعال. */
export function readWeeksFromSnapshot(
  snapshot: SyllabusConfigSnapshot,
  termId: string,
  courseCatalogId: string
): SyllabusWeek[] {
  const id = buildCourseOfferingId(termId, courseCatalogId);
  const record = snapshot.offerings[id];
  if (record?.weeks?.length) return structuredClone(record.weeks);
  const term = snapshot.terms.find((t) => t.id === termId);
  if (!term) return [];
  const catalog = findCatalogById(
    term.type,
    courseCatalogId,
    courseDefinitionsOf(snapshot)
  );
  if (!catalog) return [];
  return buildSeedWeeks(defaultWeekCount(catalog.type), 'active', id);
}

export function buildTermTitle(input: UpsertTermInput): string {
  return `${input.titlePrefix} ${persianToEnglishDigits(input.academicYear)}`.trim();
}

export function getCurrentJalaliYear(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'persian',
    year: 'numeric',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const parsed = Number.parseInt(year ?? '', 10);
  return Number.isFinite(parsed) ? parsed : 1405;
}

/** سال‌های تحصیلی انگلیسی `1405-1406` برای state فرم/API */
export function getAcademicYearOptions(date: Date = new Date()): string[] {
  const current = getCurrentJalaliYear(date);
  const list: string[] = [];
  for (let i = -1; i <= 2; i += 1) {
    const start = current + i;
    list.push(`${start}-${start + 1}`);
  }
  return list;
}
