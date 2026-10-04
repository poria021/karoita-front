import { IS_MOCK_MODE } from '@/lib/api-mode';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
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

/** mock: نوشتن‌ها چیزی ذخیره نمی‌کنند و همان snapshot ثابت را برمی‌گردانند. */
export const courseCatalogMutations = {
  /** همهٔ دروس تعریف‌شده (فعال و غیرفعال) برای صفحهٔ تعریف دروس. */
  async listCourseDefinitions(): Promise<CourseDefinition[]> {
    if (!IS_MOCK_MODE) return listRealCourseDefinitions();
    return mockSyllabusSnapshot().courseCatalog ?? [];
  },

  async createCourseDefinition(
    input: UpsertCourseDefinitionInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return createRealCourseDefinition(input);
    return mockSyllabusSnapshot();
  },

  async updateCourseDefinition(
    id: string,
    input: UpsertCourseDefinitionInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return updateRealCourseDefinition(id, input);
    return mockSyllabusSnapshot();
  },

  async deleteCourseDefinition(id: string): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return deleteRealCourseDefinition(id);
    return mockSyllabusSnapshot();
  },
};
