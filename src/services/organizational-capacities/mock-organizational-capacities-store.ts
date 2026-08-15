import { isMockApiMode } from '@/lib/api-mode';
import { readSyllabusSnapshot } from '@/services/syllabus-config/mock-syllabus-store';
import { summarizeCapacityCourses } from '@/utils/organizational-capacity-math';
import type {
  GetOrganizationalCapacitiesInput,
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCourse,
  OrganizationalCapacityKind,
  OrganizationalCapacitySubmissionStatus,
  OrganizationalCapacityWeekday,
  SubmitOrganizationalCapacitiesInput,
  UpdateOrganizationalCapacityCourseInput,
} from '@/types/organizational-capacities';
import type { AcademicTermType } from '@/types/syllabus-config';

const STORAGE_KEY = 'karvita_mock_organizational_capacities_v2';

type ActorBucket = {
  status: OrganizationalCapacitySubmissionStatus;
  courses: OrganizationalCapacityCourse[];
};

type TermBucket = Record<string, ActorBucket>;

type StoreShape = Record<string, TermBucket>;

function termTypeForKind(kind: OrganizationalCapacityKind): AcademicTermType {
  return kind === 'apprenticeship' ? 'modular' : 'semester';
}

export function listTermsForCapacityKind(
  kind: OrganizationalCapacityKind
): Array<{ id: string; title: string }> {
  const preferredType = termTypeForKind(kind);
  return readSyllabusSnapshot()
    .terms.filter((term) => term.type === preferredType)
    .map((term) => ({ id: term.id, title: term.title }));
}

function maxCapacityFromSyllabus(): number {
  const value = readSyllabusSnapshot().globalProfessorCapacity;
  return Number.isFinite(value) && value > 0 ? value : 15;
}

function buildSeedCourses(
  kind: OrganizationalCapacityKind
): OrganizationalCapacityCourse[] {
  if (kind === 'internship') {
    return [1, 2, 3, 4].map((level) => ({
      id: `intern${level}`,
      title: `کارورزی ${level}`,
      kind: 'internship' as const,
      level: level as 1 | 2 | 3 | 4,
      total: 15,
      confirmed: level === 1 ? 2 : level === 2 ? 1 : 0,
      selectedDays: (level % 2 === 0
        ? ['mon']
        : ['sat']) as OrganizationalCapacityWeekday[],
    }));
  }
  return [1, 2].map((level) => ({
    id: `appr${level}`,
    title: `کارآموزی ${level}`,
    kind: 'apprenticeship' as const,
    level: level as 1 | 2,
    total: 15,
    confirmed: level === 1 ? 1 : 0,
    selectedDays: ['tue'] as OrganizationalCapacityWeekday[],
  }));
}

let memoryStore: StoreShape | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readStore(): StoreShape {
  if (memoryStore) return memoryStore;
  if (isBrowser() && isMockApiMode()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryStore = JSON.parse(raw) as StoreShape;
        return memoryStore;
      }
    } catch {
      // fall through to empty
    }
  }
  memoryStore = {};
  return memoryStore;
}

function writeStore(store: StoreShape): void {
  memoryStore = structuredClone(store);
  if (isBrowser() && isMockApiMode()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
  }
}

function actorKey(actorId: string, kind: OrganizationalCapacityKind): string {
  return `${actorId}::${kind}`;
}

function ensureBucket(
  termId: string,
  actorId: string,
  kind: OrganizationalCapacityKind
): ActorBucket {
  const store = readStore();
  if (!store[termId]) store[termId] = {};
  const key = actorKey(actorId, kind);
  const existing = store[termId]![key];
  if (existing) return structuredClone(existing);
  const created: ActorBucket = {
    status: 'draft',
    courses: buildSeedCourses(kind),
  };
  store[termId]![key] = structuredClone(created);
  writeStore(store);
  return created;
}

function resolveTerm(
  kind: OrganizationalCapacityKind,
  termId: string
): { id: string; title: string } {
  const terms = listTermsForCapacityKind(kind);
  const match = terms.find((term) => term.id === termId);
  if (match) return match;
  if (terms[0]) return terms[0];
  return kind === 'apprenticeship'
    ? { id: 'term_modular_1', title: 'دوره مهارتی' }
    : { id: 'term_2', title: 'نیم‌سال تحصیلی' };
}

function toSnapshot(
  kind: OrganizationalCapacityKind,
  termId: string,
  actorId: string
): OrganizationalCapacitiesSnapshot {
  const term = resolveTerm(kind, termId);
  const bucket = ensureBucket(term.id, actorId, kind);
  const courses = bucket.courses.filter((course) => course.kind === kind);
  return {
    termId: term.id,
    termTitle: term.title,
    kind,
    maxCapacity: maxCapacityFromSyllabus(),
    status: bucket.status,
    courses,
    summary: summarizeCapacityCourses(courses),
    terms: listTermsForCapacityKind(kind),
  };
}

export function getMockOrganizationalCapacities(
  input: GetOrganizationalCapacitiesInput,
  actorId: string
): OrganizationalCapacitiesSnapshot {
  return toSnapshot(input.kind, input.termId, actorId);
}

export function updateMockOrganizationalCapacityCourse(
  input: UpdateOrganizationalCapacityCourseInput,
  actorId: string
): OrganizationalCapacitiesSnapshot {
  const term = resolveTerm(input.kind, input.termId);
  const store = readStore();
  const key = actorKey(actorId, input.kind);
  const bucket = ensureBucket(term.id, actorId, input.kind);
  if (bucket.status !== 'draft') {
    throw new Error('پس از ارسال نهایی، ویرایش ظرفیت قفل شده است.');
  }

  const maxCapacity = maxCapacityFromSyllabus();
  const courseIndex = bucket.courses.findIndex(
    (course) => course.id === input.courseId
  );
  if (courseIndex < 0) throw new Error('درس موردنظر یافت نشد.');

  const course = bucket.courses[courseIndex]!;
  let total = input.total;
  if (total !== null) {
    if (!Number.isFinite(total) || total < 0) {
      throw new Error('ظرفیت پذیرش نامعتبر است.');
    }
    total = Math.min(total, maxCapacity);
    if (total < course.confirmed) {
      throw new Error(
        `ظرفیت درس «${course.title}» نمی‌تواند کمتر از ثبت‌نام قطعی باشد.`
      );
    }
  }

  // Supervisor: single mutual presence day (reference toggleDay).
  const selectedDays =
    input.selectedDays.length > 0
      ? [input.selectedDays[input.selectedDays.length - 1]!]
      : [];

  const nextCourses = [...bucket.courses];
  nextCourses[courseIndex] = {
    ...course,
    total,
    selectedDays,
  };
  store[term.id]![key] = { ...bucket, courses: nextCourses };
  writeStore(store);
  return toSnapshot(input.kind, term.id, actorId);
}

export function submitMockOrganizationalCapacities(
  input: SubmitOrganizationalCapacitiesInput,
  actorId: string
): OrganizationalCapacitiesSnapshot {
  const term = resolveTerm(input.kind, input.termId);
  const store = readStore();
  const key = actorKey(actorId, input.kind);
  const bucket = ensureBucket(term.id, actorId, input.kind);
  if (bucket.status !== 'draft') {
    throw new Error('ظرفیت این نیم‌سال قبلاً ارسال شده و قفل است.');
  }

  const maxCapacity = maxCapacityFromSyllabus();
  const byId = new Map(input.courses.map((row) => [row.courseId, row]));
  const nextCourses = bucket.courses.map((course) => {
    if (course.kind !== input.kind) return course;
    const patch = byId.get(course.id);
    if (!patch) return course;
    let total = patch.total;
    if (total !== null) {
      total = Math.min(Math.max(0, total), maxCapacity);
      if (total < course.confirmed) {
        throw new Error(
          `ظرفیت درس «${course.title}» نمی‌تواند کمتر از ثبت‌نام قطعی باشد.`
        );
      }
    }
    return {
      ...course,
      total,
      selectedDays:
        patch.selectedDays.length > 0
          ? [patch.selectedDays[patch.selectedDays.length - 1]!]
          : [],
    };
  });

  store[term.id]![key] = {
    status: 'pending_admin',
    courses: nextCourses,
  };
  writeStore(store);
  return toSnapshot(input.kind, term.id, actorId);
}

export function resetMockOrganizationalCapacitiesForTests(
  store?: StoreShape | null
): void {
  memoryStore = store ? structuredClone(store) : null;
}
