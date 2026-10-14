import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  activateOfferingInSnapshot,
  deactivateOfferingInSnapshot,
  mutateSyllabusSnapshot,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import { courseDefinitionsOf } from '@/services/syllabus-config/course-catalog';
import {
  buildCourseOfferingId,
  findCatalogById,
} from '@/services/syllabus-config/syllabus-mappers';
import {
  activateRealOffering,
  deactivateRealOffering,
  saveRealSyllabusWeeks,
  setRealOfferingsStatus,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import type {
  ActivateOfferingInput,
  DeactivateOfferingInput,
  SaveSyllabusWeeksInput,
  SetOfferingsStatusInput,
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
      const catalog = findCatalogById(
        term.type,
        input.courseCatalogId,
        courseDefinitionsOf(draft)
      );
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

  /** `PATCH /admin/lessons/status` — ارائهٔ گروهی چند درس ترم. */
  async setOfferingsStatus(
    input: SetOfferingsStatusInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return setRealOfferingsStatus(input);
    }
    return mutateSyllabusSnapshot((draft) => {
      const term = draft.terms.find((t) => t.id === input.termId);
      if (!term) throw new Error('ترم انتخاب‌شده یافت نشد.');
      for (const courseCatalogId of input.courseCatalogIds) {
        if (input.status) {
          const catalog = findCatalogById(
            term.type,
            courseCatalogId,
            courseDefinitionsOf(draft)
          );
          if (!catalog) continue;
          activateOfferingInSnapshot(draft, input.termId, courseCatalogId, catalog.type);
        } else {
          const offeringId = buildCourseOfferingId(input.termId, courseCatalogId);
          if (draft.offerings[offeringId]) {
            deactivateOfferingInSnapshot(draft, offeringId);
          }
        }
      }
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
        const catalog = findCatalogById(
          term.type,
          input.courseCatalogId,
          courseDefinitionsOf(draft)
        );
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
