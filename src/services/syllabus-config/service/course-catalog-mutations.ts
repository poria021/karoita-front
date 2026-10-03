import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  buildCourseDefinition,
  cloneDefaultCourseDefinitions,
  leafIdsOfCourse,
  validateCourseDefinitionInput,
} from '@/services/syllabus-config/course-catalog';
import {
  mutateSyllabusSnapshot,
  readSyllabusSnapshot,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import {
  createRealCourseDefinition,
  deleteRealCourseDefinition,
  listRealCourseDefinitions,
  setRealCourseDefinitionActive,
  updateRealCourseDefinition,
} from '@/services/syllabus-config/real/real-course-catalog';
import type {
  CourseDefinition,
  SyllabusConfigSnapshot,
  UpsertCourseDefinitionInput,
} from '@/types/syllabus-config';

import { gateSyllabusTermSettings } from './gates';

function ensureCatalog(draft: SyllabusConfigSnapshot): CourseDefinition[] {
  if (!draft.courseCatalog) draft.courseCatalog = cloneDefaultCourseDefinitions();
  return draft.courseCatalog;
}

function findCourseOrThrow(
  catalog: CourseDefinition[],
  id: string
): CourseDefinition {
  const course = catalog.find((row) => row.id === id);
  if (!course) throw new Error('درس موردنظر یافت نشد.');
  return course;
}

/**
 * ماژولی که در ترمی ارائه‌اش فعال است نباید حذف/پنهان شود،
 * وگرنه مدیر دیگر راهی برای بستن آن ارائه از جدول ارائهٔ دروس ندارد.
 */
function assertNoActiveOfferings(
  draft: SyllabusConfigSnapshot,
  leafIds: string[],
  action: string
): void {
  if (leafIds.length === 0) return;
  const removed = new Set(leafIds);
  const blocking = Object.values(draft.offerings).find(
    (offering) => offering.isOffered && removed.has(offering.courseCatalogId)
  );
  if (!blocking) return;
  const term = draft.terms.find((row) => row.id === blocking.termId);
  throw new Error(
    `برای ${action}، ابتدا ارائهٔ این درس را در «${term?.title ?? 'ترم جاری'}» از بخش ارائه و سرفصل دروس غیرفعال کنید.`
  );
}

export const courseCatalogMutations = {
  /** همهٔ دروس تعریف‌شده (فعال و غیرفعال) برای صفحهٔ تعریف دروس. */
  async listCourseDefinitions(): Promise<CourseDefinition[]> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) return listRealCourseDefinitions();
    const snapshot = readSyllabusSnapshot();
    return structuredClone(
      snapshot.courseCatalog ?? cloneDefaultCourseDefinitions()
    );
  },

  async createCourseDefinition(
    input: UpsertCourseDefinitionInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) return createRealCourseDefinition(input);
    return mutateSyllabusSnapshot((draft) => {
      const catalog = ensureCatalog(draft);
      const error = validateCourseDefinitionInput(input, catalog);
      if (error) throw new Error(error);
      catalog.push(buildCourseDefinition(input));
    });
  },

  async updateCourseDefinition(
    id: string,
    input: UpsertCourseDefinitionInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) return updateRealCourseDefinition(id, input);
    return mutateSyllabusSnapshot((draft) => {
      const catalog = ensureCatalog(draft);
      const existing = findCourseOrThrow(catalog, id);
      const error = validateCourseDefinitionInput(
        input,
        catalog.filter((row) => row.id !== id)
      );
      if (error) throw new Error(error);

      const next = buildCourseDefinition(input, existing);
      const nextLeafIds = new Set(next.isActive ? leafIdsOfCourse(next) : []);
      const audienceChanged = next.audience !== existing.audience;
      const droppedLeafIds = leafIdsOfCourse(existing).filter(
        (leafId) => audienceChanged || !nextLeafIds.has(leafId)
      );
      assertNoActiveOfferings(draft, droppedLeafIds, 'این تغییر');

      catalog[catalog.indexOf(existing)] = next;
    });
  },

  async setCourseDefinitionActive(
    id: string,
    isActive: boolean
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) return setRealCourseDefinitionActive(id, isActive);
    return mutateSyllabusSnapshot((draft) => {
      const course = findCourseOrThrow(ensureCatalog(draft), id);
      if (!isActive) {
        assertNoActiveOfferings(draft, leafIdsOfCourse(course), 'غیرفعال کردن درس');
      }
      course.isActive = isActive;
    });
  },

  async deleteCourseDefinition(id: string): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) return deleteRealCourseDefinition(id);
    return mutateSyllabusSnapshot((draft) => {
      const catalog = ensureCatalog(draft);
      const course = findCourseOrThrow(catalog, id);
      const leafIds = leafIdsOfCourse(course);
      assertNoActiveOfferings(draft, leafIds, 'حذف درس');
      draft.courseCatalog = catalog.filter((row) => row.id !== id);
      // سرفصل‌های غیرفعال ماژول حذف‌شده یتیم نمانند.
      const removed = new Set(leafIds);
      for (const [key, offering] of Object.entries(draft.offerings)) {
        if (removed.has(offering.courseCatalogId)) delete draft.offerings[key];
      }
    });
  },
};
