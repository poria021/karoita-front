import { IS_MOCK_MODE } from '@/lib/api-mode';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
import {
  activateRealOffering,
  deactivateRealOffering,
  saveRealSyllabusWeeks,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import type {
  ActivateOfferingInput,
  DeactivateOfferingInput,
  SaveSyllabusWeeksInput,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';

/** mock: نوشتن‌ها چیزی ذخیره نمی‌کنند و همان snapshot ثابت را برمی‌گردانند. */
export const offeringMutations = {
  /** `PATCH /admin/lessons/:id/status` با `{ status: true }` */
  async activateOffering(
    input: ActivateOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return activateRealOffering(input);
    return mockSyllabusSnapshot();
  },

  /** `PATCH /admin/lessons/:id/status` با `{ status: false }` */
  async deactivateOffering(
    input: DeactivateOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return deactivateRealOffering(input);
    return mockSyllabusSnapshot();
  },

  /** `POST /admin/weeks` و `PATCH /admin/weeks/{id}` برای درس انتخاب‌شده. */
  async saveSyllabusWeeks(
    input: SaveSyllabusWeeksInput
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return saveRealSyllabusWeeks(input);
    return mockSyllabusSnapshot();
  },
};
