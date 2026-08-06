import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  activateOfferingInSnapshot,
  buildTermTitle,
  cloneSnapshot,
  deactivateOfferingInSnapshot,
  deleteOfferingsForTermId,
  getAcademicYearOptions,
  getTodayJalaliSlash,
  isTermGateActive,
  mutateSyllabusSnapshot,
  readSyllabusSnapshot,
  readWeeksFromSnapshot,
  DEFAULT_WEEK_WEIGHT,
} from '@/services/syllabus-config/mock-syllabus-store';
import {
  resolveEnrollmentSyllabusContext,
  type EnrollmentSyllabusContext,
} from '@/services/syllabus-config/syllabus-enrollment-reads';
import {
  buildCourseOfferingId,
  findCatalogById,
  getCatalogForTermType,
  listOfferingsForTerm,
} from '@/services/syllabus-config/syllabus-mappers';
import type {
  ActivateOfferingInput,
  CourseCatalogItem,
  CourseOfferingKind,
  CourseOfferingListItem,
  DeactivateOfferingInput,
  SaveSyllabusWeeksInput,
  SyllabusConfigSnapshot,
  SyllabusWeek,
  UpdateTermGatesInput,
  UpsertTermInput,
} from '@/types/syllabus-config';

function gateSyllabus(): 'mock' | never {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('SyllabusConfigService');
  }
  assertMockClientHasPermission('syllabus.manage');
  return 'mock';
}

/** Consumer reads (enrollment) — mock mode only; Nest will authorize separately. */
function gateSyllabusConsumerRead(): 'mock' | never {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('SyllabusConfigService');
  }
  return 'mock';
}

/**
 * Facade مدیریت ترم و سرفصل هفتگی.
 *
 * Nest-blocked:
 * - همگام‌سازی هفته‌های internship دانشجو پس از saveSyllabusWeeks
 * - شاخهٔ real: fail-closed تا endpoint Nest وصل شود
 */
export const SyllabusConfigService = {
  async getSnapshot(): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    return cloneSnapshot(readSyllabusSnapshot());
  },

  getAcademicYears(): string[] {
    return getAcademicYearOptions();
  },

  /** مقدار پیش‌فرض سال تحصیلی برای فرم تعریف ترم (سال جاری جلالی). */
  getDefaultAcademicYear(): string {
    return getAcademicYearOptions()[1] ?? getAcademicYearOptions()[0] ?? '';
  },

  /**
   * Context ترم فعال برای انتخاب واحد — Nest: GET /syllabus/enrollment-context
   * بدون نیاز به syllabus.manage (مصرف‌کننده enrollment).
   */
  async getEnrollmentSyllabusContext(
    kind: CourseOfferingKind,
    level: number
  ): Promise<EnrollmentSyllabusContext> {
    gateSyllabusConsumerRead();
    return resolveEnrollmentSyllabusContext(
      readSyllabusSnapshot(),
      kind,
      level
    );
  },

  /**
   * حد نصاب قبولی سیستم (۰–۱۰۰) برای ارزیابی گزارش — Nest: GET /syllabus/passing-threshold
   * مصرف‌کننده daily-approvals / progressive؛ بدون syllabus.manage.
   */
  async getPassingScoreThreshold(): Promise<number> {
    gateSyllabusConsumerRead();
    return readSyllabusSnapshot().passingScoreThreshold;
  },

  /** کاتالوگ دروس ترم — Nest: GET /terms/:termId/courses */
  async listCoursesForTerm(termId: string): Promise<CourseCatalogItem[]> {
    gateSyllabus();
    const snapshot = readSyllabusSnapshot();
    const term = snapshot.terms.find((t) => t.id === termId) ?? null;
    if (!term) return [];
    return getCatalogForTermType(term.type);
  },

  /** لیست ارائه با پرچم isOffered — Nest: GET /terms/:termId/offerings */
  async listOfferings(termId: string): Promise<CourseOfferingListItem[]> {
    gateSyllabus();
    return listOfferingsForTerm(readSyllabusSnapshot(), termId);
  },

  /**
   * خواندن هفته‌ها — بدون side-effect / بدون seed.
   * اگر ارائه ساخته نشده باشد `[]`.
   */
  async getWeeks(
    termId: string,
    courseCatalogId: string
  ): Promise<SyllabusWeek[]> {
    gateSyllabus();
    return readWeeksFromSnapshot(
      readSyllabusSnapshot(),
      termId,
      courseCatalogId
    );
  },

  async activateOffering(
    input: ActivateOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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

  async deactivateOffering(
    input: DeactivateOfferingInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    return mutateSyllabusSnapshot((draft) => {
      if (!draft.offerings[input.courseOfferingId]) {
        throw new Error('ارائهٔ درس یافت نشد.');
      }
      deactivateOfferingInSnapshot(draft, input.courseOfferingId);
    });
  },

  async updateTermGates(
    input: UpdateTermGatesInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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

  async saveSyllabusWeeks(
    input: SaveSyllabusWeeksInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    return mutateSyllabusSnapshot((draft) => {
      const existing = draft.offerings[input.courseOfferingId];
      if (!existing) throw new Error('ارائهٔ درس یافت نشد.');
      existing.weeks = structuredClone(input.weeks);

      // Nest-blocked: syncStudentWeeksWithSyllabus
      void draft.internships;
    });
  },

  async createTerm(input: UpsertTermInput): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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
    });
  },

  async deleteTerm(termId: string): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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

  async setProfessorCapacity(capacity: number): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    return mutateSyllabusSnapshot((draft) => {
      draft.globalProfessorCapacity = capacity;
    });
  },

  async setPassingThreshold(threshold: number): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    return mutateSyllabusSnapshot((draft) => {
      draft.passingScoreThreshold = threshold;
    });
  },

  resolveOfferingId(termId: string, courseCatalogId: string): string {
    return buildCourseOfferingId(termId, courseCatalogId);
  },
};

export { DEFAULT_WEEK_WEIGHT, getAcademicYearOptions, isTermGateActive };
export type { EnrollmentSyllabusContext };
