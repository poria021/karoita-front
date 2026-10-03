import { isMockApiMode } from '@/lib/api-mode';
import {
  courseDefinitionsOf,
  flattenCourseCatalog,
  legacyLeafId,
} from '@/services/syllabus-config/course-catalog';
import { readSyllabusSnapshot } from '@/services/syllabus-config/mock/mock-syllabus-store';
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

const STORAGE_KEY = 'karvita_mock_organizational_capacities_v3';

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

/**
 * درس‌های ظرفیت = درس‌های فعال کاتالوگ برای همین مخاطب (زیرمجموعه‌ها تخت شده).
 * ظرفیت/روز قبلاً ذخیره‌شده با `id` حفظ می‌شود؛ درس تازه seed می‌گیرد.
 */
function reconcileCourses(
  kind: OrganizationalCapacityKind,
  existing: readonly OrganizationalCapacityCourse[]
): OrganizationalCapacityCourse[] {
  const catalog = flattenCourseCatalog(
    courseDefinitionsOf(readSyllabusSnapshot()),
    termTypeForKind(kind)
  );
  const byId = new Map(existing.map((course) => [course.id, course]));
  return catalog.map((item, index) => {
    const saved =
      byId.get(item.id) ?? byId.get(legacyLeafId(item.id) ?? '');
    return {
      total: 15,
      confirmed: kind === 'internship' ? (index === 0 ? 2 : index === 1 ? 1 : 0) : index === 0 ? 1 : 0,
      selectedDays: ['sat'] as OrganizationalCapacityWeekday[],
      ...saved,
      id: item.id,
      title: item.title,
      kind,
      groupId: item.groupId,
      groupTitle: item.groupTitle,
    };
  });
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
      // اگر خراب بود به خالی برو
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
  const next: ActorBucket = {
    status: existing?.status ?? 'draft',
    courses: reconcileCourses(kind, existing?.courses ?? []),
  };
  if (!existing || JSON.stringify(existing) !== JSON.stringify(next)) {
    store[termId]![key] = structuredClone(next);
    writeStore(store);
  }
  return next;
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

  // استاد راهنما: یک روز حضور متقابل (مرجع `toggleDay`).
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
    status: 'draft',
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
