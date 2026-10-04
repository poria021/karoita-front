import { IS_MOCK_MODE } from '@/lib/api-mode';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
import {
  createRealTerm,
  deleteRealTerm,
  updateRealTerm,
  updateRealTermGates,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import { getRealTerm } from '@/services/syllabus-config/real/real-syllabus-reads';
import type {
  AcademicTerm,
  SyllabusConfigSnapshot,
  UpdateTermGatesInput,
  UpsertTermInput,
} from '@/types/syllabus-config';

/** mock: نوشتن‌ها چیزی ذخیره نمی‌کنند و همان snapshot ثابت را برمی‌گردانند. */
export const termMutations = {
  async getTerm(id: string): Promise<AcademicTerm | null> {
    if (!IS_MOCK_MODE) return getRealTerm(id);
    return mockSyllabusSnapshot().terms.find((term) => term.id === id) ?? null;
  },

  /**
   * `PATCH /admin/semester/:id` — گیت روی خود ترم است
   * (`courseSelection` / `startClasses`).
   */
  async updateTermGates(
    input: UpdateTermGatesInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return updateRealTermGates(input);
    return mockSyllabusSnapshot();
  },

  async createTerm(input: UpsertTermInput): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return createRealTerm(input);
    return mockSyllabusSnapshot();
  },

  async updateTerm(
    id: string,
    input: UpsertTermInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return updateRealTerm(id, input);
    return mockSyllabusSnapshot();
  },

  async deleteTerm(termId: string): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return deleteRealTerm(termId);
    return mockSyllabusSnapshot();
  },
};
