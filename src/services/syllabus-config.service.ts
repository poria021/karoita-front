import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  buildSeedWeeks,
  buildTermTitle,
  cloneSnapshot,
  defaultWeekCount,
  ensureSyllabusWeeksLoaded,
  getAcademicYearOptions,
  getCoursesForTermType,
  getTodayJalaliSlash,
  isCourseOfferedInSnapshot,
  mutateSyllabusSnapshot,
  offeringStorageKey,
  readSyllabusSnapshot,
  DEFAULT_WEEK_WEIGHT,
} from '@/services/syllabus-config/mock-syllabus-store';
import type {
  AcademicTerm,
  CourseOfferingCatalogItem,
  CourseOfferingKind,
  SyllabusConfigSnapshot,
  SyllabusWeek,
  UpsertTermInput,
} from '@/types/syllabus-config';

function requireSyllabusManage(): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('SyllabusConfigService');
  }
  assertMockClientHasPermission('syllabus.manage');
}

export type ToggleCourseOfferingInput = {
  termTitle: string;
  course: CourseOfferingCatalogItem;
};

export type SaveSyllabusWeeksInput = {
  termTitle: string;
  courseTitle: string;
  weeks: SyllabusWeek[];
};

export type UpdateTermGatesInput = {
  termTitle: string;
  isEnrollOpen?: boolean;
  isTermOpen?: boolean;
};

/**
 * Facade مدیریت ترم و سرفصل هفتگی.
 * TODO(Nest): همگام‌سازی واقعی هفته‌های internship دانشجو پس از saveSyllabusWeeks.
 */
export const SyllabusConfigService = {
  async getSnapshot(): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return cloneSnapshot(readSyllabusSnapshot());
  },

  getAcademicYears(): string[] {
    return getAcademicYearOptions();
  },

  getCoursesForTerm(term: AcademicTerm | null): CourseOfferingCatalogItem[] {
    if (!term) return [];
    return getCoursesForTermType(term.type);
  },

  isCourseOffered(termTitle: string, courseTitle: string): boolean {
    requireSyllabusManage();
    return isCourseOfferedInSnapshot(
      readSyllabusSnapshot(),
      termTitle,
      courseTitle
    );
  },

  async selectTerm(termTitle: string): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return mutateSyllabusSnapshot((draft) => {
      draft.selectedTermTitle = termTitle;
    });
  },

  async updateTermGates(
    input: UpdateTermGatesInput
  ): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return mutateSyllabusSnapshot((draft) => {
      const term = draft.terms.find((t) => t.title === input.termTitle);
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

  async getOrSeedWeeks(
    termTitle: string,
    courseTitle: string,
    kind: CourseOfferingKind
  ): Promise<SyllabusWeek[]> {
    requireSyllabusManage();
    const snapshot = mutateSyllabusSnapshot((draft) => {
      ensureSyllabusWeeksLoaded(draft, termTitle, courseTitle, kind);
    });
    const key = offeringStorageKey(termTitle, courseTitle);
    return structuredClone(snapshot.offerings[key]?.weeks ?? []);
  },

  async toggleCourseOffering(
    input: ToggleCourseOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return mutateSyllabusSnapshot((draft) => {
      const key = offeringStorageKey(input.termTitle, input.course.title);
      const offered = isCourseOfferedInSnapshot(
        draft,
        input.termTitle,
        input.course.title
      );

      if (offered) {
        const existing = draft.offerings[key];
        if (existing) {
          existing.weeks = existing.weeks.map((week) => ({
            ...week,
            status: 'archived' as const,
          }));
        }
        return;
      }

      draft.offerings[key] = {
        weeks: buildSeedWeeks(defaultWeekCount(input.course.type), 'active'),
      };
    });
  },

  async saveSyllabusWeeks(
    input: SaveSyllabusWeeksInput
  ): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return mutateSyllabusSnapshot((draft) => {
      const key = offeringStorageKey(input.termTitle, input.courseTitle);
      draft.offerings[key] = { weeks: structuredClone(input.weeks) };

      // TODO(Nest): syncStudentWeeksWithSyllabus — وقتی دامنه internship دانشجو آماده شد.
      void draft.internships;
    });
  },

  async createTerm(input: UpsertTermInput): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    const title = buildTermTitle(input);
    return mutateSyllabusSnapshot((draft) => {
      if (draft.terms.some((t) => t.title === title)) {
        throw new Error('دوره تحصیلی با این عنوان از قبل وجود دارد.');
      }
      draft.terms.push({
        id: `term_${Date.now()}`,
        title,
        type: input.type,
        isEnrollOpen: false,
        isTermOpen: false,
        enrollStart: '',
        termStart: '',
      });
      if (!draft.selectedTermTitle) {
        draft.selectedTermTitle = title;
      }
    });
  },

  async deleteTerm(termId: string): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
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
      deleteOfferingsForTerm(draft, term.title);
      if (draft.selectedTermTitle === term.title) {
        draft.selectedTermTitle = draft.terms[0]?.title ?? '';
      }
    });
  },

  async setProfessorCapacity(capacity: number): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return mutateSyllabusSnapshot((draft) => {
      draft.globalProfessorCapacity = capacity;
    });
  },

  async setPassingThreshold(threshold: number): Promise<SyllabusConfigSnapshot> {
    requireSyllabusManage();
    return mutateSyllabusSnapshot((draft) => {
      draft.passingScoreThreshold = threshold;
    });
  },
};

function deleteOfferingsForTerm(
  draft: SyllabusConfigSnapshot,
  termTitle: string
): void {
  const prefix = `C::${termTitle}::`;
  for (const key of Object.keys(draft.offerings)) {
    if (key.startsWith(prefix)) {
      delete draft.offerings[key];
    }
  }
}

export { DEFAULT_WEEK_WEIGHT, getAcademicYearOptions };
