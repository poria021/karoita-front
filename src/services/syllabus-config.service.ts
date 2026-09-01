import { IS_MOCK_MODE, isMockApiMode } from '@/lib/api-mode';
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
} from '@/services/syllabus-config/mock/mock-syllabus-store';
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
import {
  activateRealOffering,
  createRealTerm,
  deactivateRealOffering,
  deleteRealTerm,
  saveRealSyllabusWeeks,
  updateRealTerm,
  setRealPassingThreshold,
  setRealProfessorCapacity,
  updateRealTermGates,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import { catalogKindForTermType } from '@/services/syllabus-config/real/real-syllabus-mappers';
import {
  getRealSyllabusSnapshot,
  getRealTerm,
  getRealTermCourseContext,
  getRealWeeksForLesson,
  listRealCoursesForTerm,
  listRealOfferingsForTerm,
} from '@/services/syllabus-config/real/real-syllabus-reads';
import type {
  AcademicTerm,
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

function gateSyllabus(): void {
  if (isMockApiMode()) {
    assertMockClientHasPermission('syllabus.manage');
  }
}

function gateSyllabusTermSettings(): void {
  if (isMockApiMode()) {
    assertMockClientHasPermission('syllabus.term-settings');
  }
}

/** خوانندهٔ ثبت‌نام/تأیید روزانه — در real، `Nest` خودش authz می‌کند. */
function gateSyllabusConsumerRead(): void {
  if (isMockApiMode()) {
    // مسیر فقط-خواندنی mock گارد `syllabus.manage` نمی‌خواهد
  }
}

/**
 * نمای سرفصل ترم و هفته. UI فقط همین Facade را صدا می‌زند.
 * `getEnrollmentSyllabusContext` تا آمدن route مصرف‌کننده در Nest خالی برمی‌گردد.
 */
export const SyllabusConfigService = {
  /** `GET /admin/semester` + `GET /admin/settings` */
  async getSnapshot(): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return getRealSyllabusSnapshot();
    }
    return cloneSnapshot(readSyllabusSnapshot());
  },

  getAcademicYears(): string[] {
    return getAcademicYearOptions();
  },

  getDefaultAcademicYear(): string {
    return getAcademicYearOptions()[1] ?? getAcademicYearOptions()[0] ?? '';
  },

  /** تا آمدن route مصرف‌کننده در Nest خالی برمی‌گردد — throw نمی‌کند. */
  async getEnrollmentSyllabusContext(
    kind: CourseOfferingKind,
    level: number
  ): Promise<EnrollmentSyllabusContext> {
    gateSyllabusConsumerRead();
    if (!IS_MOCK_MODE) {
      return {
        term: null,
        termId: `mock-term-${kind}`,
        termTitle: 'نیم‌سال جاری',
        syllabusConfigured: false,
        enrollOpen: false,
        termOpen: false,
      };
    }
    return resolveEnrollmentSyllabusContext(readSyllabusSnapshot(), kind, level);
  },

  async getPassingScoreThreshold(): Promise<number> {
    gateSyllabusConsumerRead();
    if (!IS_MOCK_MODE) {
      const snapshot = await getRealSyllabusSnapshot();
      return snapshot.passingScoreThreshold;
    }
    return readSyllabusSnapshot().passingScoreThreshold;
  },

  /** از snapshot موجود؛ HTTP اضافه نمی‌زند. */
  termContextFromSnapshot(
    snapshot: SyllabusConfigSnapshot,
    termId: string
  ): {
    courses: CourseCatalogItem[];
    offerings: CourseOfferingListItem[];
  } | null {
    const term = snapshot.terms.find((row) => row.id === termId) ?? null;
    if (!term) return null;
    if (!IS_MOCK_MODE) {
      const kind = catalogKindForTermType(term.type);
      const records = Object.values(snapshot.offerings).filter(
        (row) => row.termId === termId
      );
      const courses: CourseCatalogItem[] = records.map((row) => ({
        id: row.courseCatalogId,
        title: row.title?.trim() ?? '',
        type: row.type ?? kind,
      }));
      const offerings: CourseOfferingListItem[] = records.map((row) => ({
        courseOfferingId: row.id,
        courseCatalogId: row.courseCatalogId,
        title: row.title?.trim() ?? '',
        type: row.type ?? kind,
        isOffered: row.isOffered,
      }));
      // بدون عنوان درس، hydrate به درد UI نمی‌خورد — باید `semesters_all` زده شود.
      if (
        courses.length > 0 &&
        courses.every((course) => course.title.length === 0)
      ) {
        return null;
      }
      return { courses, offerings };
    }
    return {
      courses: getCatalogForTermType(term.type),
      offerings: listOfferingsForTerm(snapshot, termId),
    };
  },

  weeksFromSnapshot(
    snapshot: SyllabusConfigSnapshot,
    termId: string,
    courseCatalogId: string
  ): SyllabusWeek[] {
    if (!IS_MOCK_MODE) {
      return structuredClone(
        snapshot.offerings[courseCatalogId]?.weeks ?? []
      );
    }
    return readWeeksFromSnapshot(snapshot, termId, courseCatalogId);
  },

  /** `GET /admin/semesters_all` — درس و پرچم ارائه در یک رفت‌وبرگشت. */
  async listCoursesAndOfferingsForTerm(termId: string): Promise<{
    courses: CourseCatalogItem[];
    offerings: CourseOfferingListItem[];
  }> {
    gateSyllabus();
    if (!IS_MOCK_MODE) return getRealTermCourseContext(termId);
    const snapshot = readSyllabusSnapshot();
    const term = snapshot.terms.find((t) => t.id === termId) ?? null;
    if (!term) return { courses: [], offerings: [] };
    return {
      courses: getCatalogForTermType(term.type),
      offerings: listOfferingsForTerm(snapshot, termId),
    };
  },

  async listCoursesForTerm(termId: string): Promise<CourseCatalogItem[]> {
    gateSyllabus();
    if (!IS_MOCK_MODE) return listRealCoursesForTerm(termId);
    const snapshot = readSyllabusSnapshot();
    const term = snapshot.terms.find((t) => t.id === termId) ?? null;
    if (!term) return [];
    return getCatalogForTermType(term.type);
  },

  /** در Nest پرچم ارائه همان `lesson.status` است. */
  async listOfferings(termId: string): Promise<CourseOfferingListItem[]> {
    gateSyllabus();
    if (!IS_MOCK_MODE) return listRealOfferingsForTerm(termId);
    return listOfferingsForTerm(readSyllabusSnapshot(), termId);
  },

  async getWeeks(
    termId: string,
    courseCatalogId: string
  ): Promise<SyllabusWeek[]> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return getRealWeeksForLesson(termId, courseCatalogId);
    }
    return readWeeksFromSnapshot(
      readSyllabusSnapshot(),
      termId,
      courseCatalogId
    );
  },

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

  /**
   * `PATCH /admin/semester/:id` — گیت روی خود ترم است
   * (`courseSelection` / `startClasses`).
   */
  async updateTermGates(
    input: UpdateTermGatesInput
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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

  /** `POST /admin/weeks` + `PATCH /admin/weeks/{id}` */
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

  async getTerm(id: string): Promise<AcademicTerm | null> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return getRealTerm(id);
    }
    return readSyllabusSnapshot().terms.find((term) => term.id === id) ?? null;
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

  /** `POST /admin/settings` — Nest برای تنظیمات PATCH ندارد. */
  async setProfessorCapacity(
    capacity: number
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return setRealProfessorCapacity(capacity);
    }
    return mutateSyllabusSnapshot((draft) => {
      draft.globalProfessorCapacity = capacity;
    });
  },

  /** `POST /admin/settings` — هر نوشته ردیف جدید می‌سازد. */
  async setPassingThreshold(
    threshold: number
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return setRealPassingThreshold(threshold);
    }
    return mutateSyllabusSnapshot((draft) => {
      draft.passingScoreThreshold = threshold;
    });
  },

  resolveOfferingId(termId: string, courseCatalogId: string): string {
    if (!IS_MOCK_MODE) return courseCatalogId;
    return buildCourseOfferingId(termId, courseCatalogId);
  },
};

export { DEFAULT_WEEK_WEIGHT, getAcademicYearOptions, isTermGateActive };
export type { EnrollmentSyllabusContext };
