import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  buildTermTitle,
  deleteOfferingsForTermId,
  getTodayJalaliSlash,
  mutateSyllabusSnapshot,
  readSyllabusSnapshot,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
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

import { gateSyllabusTermSettings } from './gates';

export const termMutations = {
  async getTerm(id: string): Promise<AcademicTerm | null> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return getRealTerm(id);
    }
    return readSyllabusSnapshot().terms.find((term) => term.id === id) ?? null;
  },

  /**
   * `PATCH /admin/semester/:id` — گیت روی خود ترم است
   * (`courseSelection` / `startClasses`).
   */
  async updateTermGates(
    input: UpdateTermGatesInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return updateRealTermGates(input);
    }
    return mutateSyllabusSnapshot((draft) => {
      const term = draft.terms.find((t) => t.id === input.termId);
      if (!term) throw new Error('ترم انتخاب‌شده یافت نشد.');
      if (input.isEnrollOpen !== undefined) {
        term.isEnrollOpen = input.isEnrollOpen;
        term.enrollStart = input.isEnrollOpen ? getTodayJalaliSlash() : '';
      }
      if (input.isTermOpen !== undefined) {
        term.isTermOpen = input.isTermOpen;
        term.termStart = input.isTermOpen ? getTodayJalaliSlash() : '';
      }
    });
  },

  async createTerm(input: UpsertTermInput): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return createRealTerm(input);
    }
    const title = buildTermTitle(input);
    return mutateSyllabusSnapshot((draft) => {
      if (draft.terms.some((t) => t.title === title)) {
        throw new Error('دوره تحصیلی با این عنوان از قبل وجود دارد.');
      }
      draft.terms.push({
        id: `term_${Date.now()}`,
        title,
        type: input.type,
        titlePrefix: input.titlePrefix,
        academicYear: input.academicYear,
        isEnrollOpen: false,
        isTermOpen: false,
        enrollStart: '',
        termStart: '',
      });
    });
  },

  async updateTerm(
    id: string,
    input: UpsertTermInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return updateRealTerm(id, input);
    }
    const title = buildTermTitle(input);
    return mutateSyllabusSnapshot((draft) => {
      const term = draft.terms.find((item) => item.id === id);
      if (!term) throw new Error('دوره تحصیلی یافت نشد.');
      if (draft.terms.some((item) => item.id !== id && item.title === title)) {
        throw new Error('دوره تحصیلی با این عنوان از قبل وجود دارد.');
      }
      term.title = title;
      term.type = input.type;
      term.titlePrefix = input.titlePrefix;
      term.academicYear = input.academicYear;
    });
  },

  async deleteTerm(termId: string): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return deleteRealTerm(termId);
    }
    return mutateSyllabusSnapshot((draft) => {
      const term = draft.terms.find((t) => t.id === termId);
      if (!term) throw new Error('دوره تحصیلی یافت نشد.');

      const hasInternships = draft.internships.some(
        (item) => item.semester === term.title
      );
      if (hasInternships) {
        throw new Error(
          'خطای حاکمیتی: امکان حذف این دوره وجود ندارد زیرا سوابق آموزشی ثبت‌نام کارورزان شناسایی شد.'
        );
      }

      draft.terms = draft.terms.filter((t) => t.id !== termId);
      deleteOfferingsForTermId(draft, termId);
    });
  },
};
