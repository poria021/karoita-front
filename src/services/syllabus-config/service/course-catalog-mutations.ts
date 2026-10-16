import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  assignEnrollmentLevels,
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

function assertNoOfferingHistory(
  draft: SyllabusConfigSnapshot,
  leafIds: string[]
): void {
  const leaves = new Set(leafIds);
  const used = Object.values(draft.offerings).find((offering) =>
    leaves.has(offering.courseCatalogId)
  );
  if (!used) return;
  const term = draft.terms.find((row) => row.id === used.termId);
  throw new Error(
    `این درس در «${term?.title ?? 'یکی از ترم‌ها'}» ارائه یا سرفصل دارد و سابقه‌اش باید حفظ شود؛ به‌جای حذف، آن را بایگانی کنید.`
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
      const created = buildCourseDefinition(input);
      assignEnrollmentLevels(draft, created);
      catalog.push(created);
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
      assignEnrollmentLevels(draft, next);
      const nextLeafIds = new Set(next.isActive ? leafIdsOfCourse(next) : []);
      const audienceChanged = next.audience !== existing.audience;
      const droppedLeafIds = leafIdsOfCourse(existing).filter(
        (leafId) => audienceChanged || !nextLeafIds.has(leafId)
      );
      assertNoActiveOfferings(draft, droppedLeafIds, 'این تغییر');

      catalog[catalog.indexOf(existing)] = next;
    });
  },

  /**
   * حذف واقعی فقط برای درسی است که هیچ ارائه/سرفصلی در هیچ ترمی ندارد (مثلاً اشتباه ساخته شده).
   * درسی که حتی یک‌بار در ترمی ارائه یا سرفصل‌بندی شده سابقه دارد؛ حذفش
   * ارائه‌ها و سرفصل ترم‌های گذشته را هم پاک می‌کرد، پس باید بایگانی شود
   * (`isActive: false` از `updateCourseDefinition`). ارائه‌ای هرگز اینجا پاک نمی‌شود.
   */
  async deleteCourseDefinition(id: string): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) return deleteRealCourseDefinition(id);
    return mutateSyllabusSnapshot((draft) => {
      const catalog = ensureCatalog(draft);
      const course = findCourseOrThrow(catalog, id);
      assertNoOfferingHistory(draft, leafIdsOfCourse(course));
      draft.courseCatalog = catalog.filter((row) => row.id !== id);
    });
  },
};
