import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  activateOfferingInSnapshot,
  deactivateOfferingInSnapshot,
  mutateSyllabusSnapshot,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import { findCatalogById } from '@/services/syllabus-config/syllabus-mappers';
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

import { gateSyllabus } from './gates';

export const offeringMutations = {
  /** `PATCH /admin/lessons/:id/status` با `{ status: true }` */
  async activateOffering(
    input: ActivateOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return activateRealOffering(input);
    }
    return mutateSyllabusSnapshot((draft) => {
      const term = draft.terms.find((t) => t.id === input.termId);
      if (!term) throw new Error('ترم انتخاب‌شده یافت نشد.');
      const catalog = findCatalogById(term.type, input.courseCatalogId);
      if (!catalog) throw new Error('درس کاتالوگ یافت نشد.');
      activateOfferingInSnapshot(
        draft,
        input.termId,
        input.courseCatalogId,
        catalog.type
      );
    });
  },

  /** `PATCH /admin/lessons/:id/status` با `{ status: false }` */
  async deactivateOffering(
    input: DeactivateOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return deactivateRealOffering(input);
    }
    return mutateSyllabusSnapshot((draft) => {
      if (!draft.offerings[input.courseOfferingId]) {
        throw new Error('ارائهٔ درس یافت نشد.');
      }
      deactivateOfferingInSnapshot(draft, input.courseOfferingId);
    });
  },

  /** `POST /admin/weeks` و `PATCH /admin/weeks/{id}` برای درس انتخاب‌شده. */
  async saveSyllabusWeeks(
    input: SaveSyllabusWeeksInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return saveRealSyllabusWeeks(input);
    }
    return mutateSyllabusSnapshot((draft) => {
      const existing = draft.offerings[input.courseOfferingId];
      if (!existing) {
        const term = draft.terms.find((t) => t.id === input.termId);
        if (!term) throw new Error('ترم انتخاب‌شده یافت نشد.');
        const catalog = findCatalogById(term.type, input.courseCatalogId);
        if (!catalog) throw new Error('درس کاتالوگ یافت نشد.');
        draft.offerings[input.courseOfferingId] = {
          id: input.courseOfferingId,
          termId: input.termId,
          courseCatalogId: input.courseCatalogId,
          isOffered: false,
          weeks: structuredClone(input.weeks),
        };
      } else {
        existing.weeks = structuredClone(input.weeks);
      }
      void draft.internships;
    });
  },
};
