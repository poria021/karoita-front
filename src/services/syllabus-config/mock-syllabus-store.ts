import { isMockApiMode } from '@/lib/api-mode';
import type {
  AcademicTerm,
  AcademicTermType,
  CourseOfferingCatalogItem,
  CourseOfferingKind,
  CourseSyllabusConfig,
  SyllabusConfigSnapshot,
  SyllabusWeek,
  UpsertTermInput,
} from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

const STORAGE_KEY = 'karvita_mock_syllabus_config_v1';

export const INTERNSHIP_DEFAULT_WEEKS = 16;
export const APPRENTICESHIP_DEFAULT_WEEKS = 8;
export const DEFAULT_WEEK_WEIGHT = 3;

let memorySnapshot: SyllabusConfigSnapshot | null = null;

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function cloneSnapshot(
  data: SyllabusConfigSnapshot
): SyllabusConfigSnapshot {
  return structuredClone(data);
}

export function normalizeCourseTitle(title: string): string {
  return persianToEnglishDigits(title).trim();
}

export function offeringStorageKey(
  termTitle: string,
  courseTitle: string
): string {
  return `C::${termTitle}::${normalizeCourseTitle(courseTitle)}`;
}

export function getCoursesForTermType(
  type: AcademicTermType
): CourseOfferingCatalogItem[] {
  if (type === 'semester') {
    return [
      { title: 'کارورزی ۱', type: 'internship' },
      { title: 'کارورزی ۲', type: 'internship' },
      { title: 'کارورزی ۳', type: 'internship' },
      { title: 'کارورزی ۴', type: 'internship' },
    ];
  }
  return [
    { title: 'کارآموزی ۱', type: 'apprenticeship' },
    { title: 'کارآموزی ۲', type: 'apprenticeship' },
  ];
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
  ];

  return {
    terms,
    offerings: {},
    internships: [],
    globalProfessorCapacity: 15,
    passingScoreThreshold: 70,
    selectedTermTitle: terms[1]?.title ?? terms[0]?.title ?? '',
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
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memorySnapshot = JSON.parse(raw) as SyllabusConfigSnapshot;
        return memorySnapshot;
      }
    } catch {
      // fall through to seed
    }
  }

  memorySnapshot = buildSeedSnapshot();
  return memorySnapshot;
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

export function isCourseOfferedInSnapshot(
  snapshot: SyllabusConfigSnapshot,
  termTitle: string,
  courseTitle: string
): boolean {
  const key = offeringStorageKey(termTitle, courseTitle);
  const config = snapshot.offerings[key];
  return Boolean(config?.weeks.some((w) => w.status === 'active'));
}

/** اگر پیکربندی هفته‌ها نباشد، با وضعیت آرشیو seed می‌کند. */
export function ensureSyllabusWeeksLoaded(
  snapshot: SyllabusConfigSnapshot,
  termTitle: string,
  courseTitle: string,
  kind: CourseOfferingKind
): SyllabusWeek[] {
  const key = offeringStorageKey(termTitle, courseTitle);
  const existing = snapshot.offerings[key];
  if (existing?.weeks.length) {
    return existing.weeks;
  }

  const weeks = buildSeedWeeks(defaultWeekCount(kind), 'archived');
  snapshot.offerings[key] = { weeks };
  return weeks;
}

export function buildTermTitle(
  input: UpsertTermInput
): string {
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

/** امروز جلالی با ارقام انگلیسی `YYYY/MM/DD` برای state/API */
export function getTodayJalaliSlash(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'persian',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}/${month}/${day}`;
}

/** مقایسهٔ تاریخ‌های `YYYY/MM/DD` (انگلیسی یا فارسی ارقام) */
export function isJalaliSlashOnOrBefore(
  candidate: string,
  reference: string
): boolean {
  const left = persianToEnglishDigits(candidate.trim());
  const right = persianToEnglishDigits(reference.trim());
  if (!left || !right) return false;
  return left <= right;
}

/** درگاه فعال است اگر سوییچ باز باشد و تاریخ شروع ≤ امروز */
export function isTermGateActive(
  isOpen: boolean,
  startDate: string,
  today: string = getTodayJalaliSlash()
): boolean {
  return isOpen && isJalaliSlashOnOrBefore(startDate, today);
}
