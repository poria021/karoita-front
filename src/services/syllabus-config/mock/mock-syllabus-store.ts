import { isMockApiMode } from '@/lib/api-mode';
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
  findCatalogByTitle,
  getCatalogForTermType,
  legacyOfferingStorageKey,
  normalizeCourseTitle,
} from '../syllabus-mappers';
import {
  DEFAULT_WEEK_WEIGHT,
  getTodayJalaliSlash,
  isJalaliSlashOnOrBefore,
  isTermGateActive,
} from '../syllabus-term-gates';

export {
  DEFAULT_WEEK_WEIGHT,
  getTodayJalaliSlash,
  isJalaliSlashOnOrBefore,
  isTermGateActive,
} from '../syllabus-term-gates';

const STORAGE_KEY = 'karvita_mock_syllabus_config_v3';
const LEGACY_STORAGE_KEY_V2 = 'karvita_mock_syllabus_config_v2';
const LEGACY_STORAGE_KEY = 'karvita_mock_syllabus_config_v1';

export const INTERNSHIP_DEFAULT_WEEKS = 16;
export const APPRENTICESHIP_DEFAULT_WEEKS = 8;

let memorySnapshot: SyllabusConfigSnapshot | null = null;

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function cloneSnapshot(
  data: SyllabusConfigSnapshot
): SyllabusConfigSnapshot {
  return structuredClone(data);
}

export function defaultWeekCount(kind: CourseOfferingKind): number {
  return kind === 'apprenticeship'
    ? APPRENTICESHIP_DEFAULT_WEEKS
    : INTERNSHIP_DEFAULT_WEEKS;
}

export function buildSeedWeeks(
  count: number,
  status: SyllabusWeek['status']
): SyllabusWeek[] {
  const stamp = Date.now();
  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    const label = `هفته ${n}`;
    return {
      id: `week_${stamp}_${n}`,
      suffix: label,
      title: label,
      weight: DEFAULT_WEEK_WEIGHT,
      status,
    };
  });
}

function buildSeedSnapshot(): SyllabusConfigSnapshot {
  const terms: AcademicTerm[] = [
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
      isEnrollOpen: false,
      isTermOpen: false,
      enrollStart: '',
      termStart: '',
    },
    {
      id: 'term_modular_1',
      title: 'دوره مهارتی 1405-1406',
      type: 'modular',
      isEnrollOpen: false,
      isTermOpen: false,
      enrollStart: '',
      termStart: '',
    },
  ];

  return {
    terms,
    offerings: {},
    internships: [],
    globalProfessorCapacity: 15,
    passingScoreThreshold: 70,
  };
}

type LegacyOffering = { weeks: SyllabusWeek[] };

type LegacySnapshot = {
  terms: AcademicTerm[];
  offerings: Record<string, LegacyOffering | CourseOfferingRecord>;
  internships: SyllabusConfigSnapshot['internships'];
  globalProfessorCapacity: number;
  passingScoreThreshold: number;
  selectedTermTitle?: string;
};

function isCourseOfferingRecord(
  value: LegacyOffering | CourseOfferingRecord
): value is CourseOfferingRecord {
  return 'termId' in value && 'courseCatalogId' in value && 'id' in value;
}

/** مهاجرت v1 (کلید title) → v2 (courseOfferingId). */
export function migrateLegacySnapshot(
  raw: LegacySnapshot
): SyllabusConfigSnapshot {
  const offerings: Record<string, CourseOfferingRecord> = {};

  for (const [key, value] of Object.entries(raw.offerings ?? {})) {
    if (isCourseOfferingRecord(value)) {
      const weeks = structuredClone(value.weeks ?? []);
      offerings[value.id] = {
        ...value,
        weeks,
        isOffered:
          'isOffered' in value && typeof value.isOffered === 'boolean'
            ? value.isOffered
            : weeks.some((week) => week.status === 'active'),
      };
      continue;
    }

    if (!key.startsWith('C::')) continue;
    const parts = key.slice(3).split('::');
    if (parts.length < 2) continue;
    const termTitle = parts[0] ?? '';
    const courseTitle = parts.slice(1).join('::');
    const term = raw.terms.find((t) => t.title === termTitle);
    if (!term) continue;
    const catalog = findCatalogByTitle(term.type, courseTitle);
    if (!catalog) continue;
    const id = buildCourseOfferingId(term.id, catalog.id);
    const weeks = structuredClone(value.weeks ?? []);
    offerings[id] = {
      id,
      termId: term.id,
      courseCatalogId: catalog.id,
      isOffered: weeks.some((week) => week.status === 'active'),
      weeks,
    };
  }

  return {
    terms: raw.terms ?? [],
    offerings,
    internships: raw.internships ?? [],
    globalProfessorCapacity: raw.globalProfessorCapacity ?? 15,
    passingScoreThreshold: raw.passingScoreThreshold ?? 70,
  };
}

function persist(snapshot: SyllabusConfigSnapshot): void {
  memorySnapshot = snapshot;
  if (!isBrowser() || !isMockApiMode()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function readSyllabusSnapshot(): SyllabusConfigSnapshot {
  if (memorySnapshot) return memorySnapshot;

  if (isBrowser() && isMockApiMode()) {
    try {
      const v3 = window.localStorage.getItem(STORAGE_KEY);
      if (v3) {
        memorySnapshot = migrateLegacySnapshot(
          JSON.parse(v3) as LegacySnapshot
        );
        return memorySnapshot;
      }
      const v2 = window.localStorage.getItem(LEGACY_STORAGE_KEY_V2);
      if (v2) {
        memorySnapshot = migrateLegacySnapshot(
          JSON.parse(v2) as LegacySnapshot
        );
        ensureModularTerm(memorySnapshot);
        persist(memorySnapshot);
        return memorySnapshot;
      }
      const v1 = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (v1) {
        memorySnapshot = migrateLegacySnapshot(
          JSON.parse(v1) as LegacySnapshot
        );
        ensureModularTerm(memorySnapshot);
        persist(memorySnapshot);
        return memorySnapshot;
      }
    } catch {
      // اگر خراب بود به seed برو
    }
  }

  memorySnapshot = buildSeedSnapshot();
  return memorySnapshot;
}

/** مصرف‌کنندهٔ مهارت‌آموزی همیشه استخر ترم پودمانی داشته باشد. */
function ensureModularTerm(snapshot: SyllabusConfigSnapshot): void {
  if (snapshot.terms.some((term) => term.type === 'modular')) return;
  snapshot.terms.push({
    id: 'term_modular_1',
    title: 'دوره مهارتی 1405-1406',
    type: 'modular',
    isEnrollOpen: false,
    isTermOpen: false,
    enrollStart: '',
    termStart: '',
  });
}

export function resetSyllabusSnapshotForTests(
  snapshot?: SyllabusConfigSnapshot | null
): void {
  memorySnapshot = snapshot ? cloneSnapshot(snapshot) : null;
}

export function writeSyllabusSnapshot(
  snapshot: SyllabusConfigSnapshot
): SyllabusConfigSnapshot {
  const next = cloneSnapshot(snapshot);
  persist(next);
  return next;
}

export function mutateSyllabusSnapshot(
  mutator: (draft: SyllabusConfigSnapshot) => void
): SyllabusConfigSnapshot {
  const draft = cloneSnapshot(readSyllabusSnapshot());
  mutator(draft);
  return writeSyllabusSnapshot(draft);
}

export function readWeeksFromSnapshot(
  snapshot: SyllabusConfigSnapshot,
  termId: string,
  courseCatalogId: string
): SyllabusWeek[] {
  const id = buildCourseOfferingId(termId, courseCatalogId);
  const record = snapshot.offerings[id];
  if (record && record.weeks && record.weeks.length > 0) {
    return structuredClone(record.weeks);
  }
  const term = snapshot.terms.find((t) => t.id === termId);
  if (!term) return [];
  const catalog = findCatalogById(term.type, courseCatalogId);
  if (!catalog) return [];
  const count = defaultWeekCount(catalog.type);
  return buildSeedWeeks(count, 'active');
}

export function activateOfferingInSnapshot(
  draft: SyllabusConfigSnapshot,
  termId: string,
  courseCatalogId: string,
  kind: CourseOfferingKind
): CourseOfferingRecord {
  const id = buildCourseOfferingId(termId, courseCatalogId);
  const existing = draft.offerings[id];
  const count = defaultWeekCount(kind);
  if (existing) {
    existing.isOffered = true;
    if (!existing.weeks || existing.weeks.length === 0) {
      existing.weeks = buildSeedWeeks(count, 'active');
    }
    return existing;
  }

  const record: CourseOfferingRecord = {
    id,
    termId,
    courseCatalogId,
    isOffered: true,
    weeks: buildSeedWeeks(count, 'active'),
  };
  draft.offerings[id] = record;
  return record;
}

export function deactivateOfferingInSnapshot(
  draft: SyllabusConfigSnapshot,
  courseOfferingId: string
): void {
  const existing = draft.offerings[courseOfferingId];
  if (!existing) return;
  existing.isOffered = false;
}

export function deleteOfferingsForTermId(
  draft: SyllabusConfigSnapshot,
  termId: string
): void {
  for (const key of Object.keys(draft.offerings)) {
    if (draft.offerings[key]?.termId === termId) {
      delete draft.offerings[key];
    }
  }
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

/** امروز جلالی با ارقام انگلیسی `YYYY/MM/DD` برای state/API — به `syllabus-term-gates` منتقل شد. */

export {
  getCatalogForTermType as getCoursesForTermType,
  legacyOfferingStorageKey as offeringStorageKey,
  normalizeCourseTitle,
};
