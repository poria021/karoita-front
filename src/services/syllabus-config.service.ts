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
  setRealPassingThreshold,
  setRealProfessorCapacity,
  updateRealTermGates,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import { catalogKindForTermType } from '@/services/syllabus-config/real/real-syllabus-mappers';
import {
  getRealSyllabusSnapshot,
  getRealTermCourseContext,
  getRealWeeksForLesson,
  listRealCoursesForTerm,
  listRealOfferingsForTerm,
} from '@/services/syllabus-config/real/real-syllabus-reads';
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

// ─── Auth guards ──────────────────────────────────────────────────────────────

function gateSyllabus(): void {
  if (isMockApiMode()) {
    assertMockClientHasPermission('syllabus.manage');
  }
}

/** Enrollment/daily-approvals consumers — Nest authorises separately. */
function gateSyllabusConsumerRead(): void {
  // No permission check for consumers in real mode — Nest handles authz.
  if (isMockApiMode()) {
    // no extra mock permission needed for read-only consumer paths
  }
}

/**
 * Term + weekly syllabus admin façade.
 *
 * Real-mode routing:
 * - GET    /admin/semester                           → listSemesters
 * - POST   /admin/semester                           → createSemester
 * - DELETE /admin/semester/:id                       → deleteSemester
 * - GET    /admin/settings                           → getAcademicSettings
 * - POST   /admin/settings                           → createAcademicSettings
 * - GET    /admin/semesters_all                      → lessons + offering flags
 * - GET    /admin/weeks/lesson/:lessonId             → weekly syllabus
 * - PATCH  /admin/lessons/:id/status                 → offering + term gates
 * - PUT    /admin/lessons/:lessonId/weeks            → replace-all weeks
 *
 * Enrollment-context remains mock-only until Nest exposes a consumer route.
 */
export const SyllabusConfigService = {
  // ─── Snapshot (read) ───────────────────────────────────────────────────────

  /** GET /admin/semester + GET /admin/settings (real) | mock snapshot */
  async getSnapshot(): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return getRealSyllabusSnapshot();
    }
    return cloneSnapshot(readSyllabusSnapshot());
  },

  // ─── Academic-year helpers (mock + real share the same Jalali util) ────────

  getAcademicYears(): string[] {
    return getAcademicYearOptions();
  },

  /** Default academic year for the create-term form (current Jalali year). */
  getDefaultAcademicYear(): string {
    return getAcademicYearOptions()[1] ?? getAcademicYearOptions()[0] ?? '';
  },

  // ─── Consumer reads (enrollment / daily-approvals) ────────────────────────

  /** GET /syllabus/enrollment-context — no syllabus.manage required */
  async getEnrollmentSyllabusContext(
    kind: CourseOfferingKind,
    level: number
  ): Promise<EnrollmentSyllabusContext> {
    gateSyllabusConsumerRead();
    if (!IS_MOCK_MODE) {
      // Real Nest route not wired yet — fall back to empty context so consumers
      // degrade gracefully rather than throwing.
      return { term: null, offering: null, weeks: [] };
    }
    return resolveEnrollmentSyllabusContext(readSyllabusSnapshot(), kind, level);
  },

  /** GET /syllabus/passing-threshold — shared by daily-approvals */
  async getPassingScoreThreshold(): Promise<number> {
    gateSyllabusConsumerRead();
    if (!IS_MOCK_MODE) {
      const snapshot = await getRealSyllabusSnapshot();
      return snapshot.passingScoreThreshold;
    }
    return readSyllabusSnapshot().passingScoreThreshold;
  },

  // ─── Course catalog + offerings ────────────────────────────────────────────

  /** Derive term courses from an already-fetched snapshot — no extra HTTP. */
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
      // Snapshot hydrate without labels is unusable — fetch lessons instead.
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

  /** GET /admin/semesters_all — courses + offering flags in one round-trip. */
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

  /** GET /admin/semesters_all (real) | mock catalog for the term type */
  async listCoursesForTerm(termId: string): Promise<CourseCatalogItem[]> {
    gateSyllabus();
    if (!IS_MOCK_MODE) return listRealCoursesForTerm(termId);
    const snapshot = readSyllabusSnapshot();
    const term = snapshot.terms.find((t) => t.id === termId) ?? null;
    if (!term) return [];
    return getCatalogForTermType(term.type);
  },

  /** GET /admin/semesters_all — lesson.status is the ارائه flag */
  async listOfferings(termId: string): Promise<CourseOfferingListItem[]> {
    gateSyllabus();
    if (!IS_MOCK_MODE) return listRealOfferingsForTerm(termId);
    return listOfferingsForTerm(readSyllabusSnapshot(), termId);
  },

  /** GET /admin/weeks/lesson/:lessonId */
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

  // ─── Offering mutations ───────────────────────────────────────────────────

  /** PATCH /admin/lessons/:id/status { status: true } */
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

  /** PATCH /admin/lessons/:id/status { status: false } */
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

  // ─── Term gates ───────────────────────────────────────────────────────────

  /**
   * PATCH /admin/lessons/:id/status for every lesson of the term
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

  // ─── Weekly syllabus ──────────────────────────────────────────────────────

  /** PUT /admin/lessons/:lessonId/weeks */
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

  // ─── Term CRUD — real + mock ───────────────────────────────────────────────

  /**
   * POST /admin/semester (real) | mock store mutation.
   * Returns the refreshed SyllabusConfigSnapshot.
   */
  async createTerm(input: UpsertTermInput): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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

  /**
   * DELETE /admin/semester/:id (real) | mock store mutation.
   * Returns the refreshed SyllabusConfigSnapshot.
   */
  async deleteTerm(termId: string): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
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

  // ─── Global settings — real + mock ────────────────────────────────────────

  /**
   * POST /admin/settings (real) | mock snapshot mutation.
   * Returns the refreshed SyllabusConfigSnapshot.
   */
  async setProfessorCapacity(
    capacity: number
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return setRealProfessorCapacity(capacity);
    }
    return mutateSyllabusSnapshot((draft) => {
      draft.globalProfessorCapacity = capacity;
    });
  },

  /**
   * POST /admin/settings (real) | mock snapshot mutation.
   * Returns the refreshed SyllabusConfigSnapshot.
   */
  async setPassingThreshold(
    threshold: number
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return setRealPassingThreshold(threshold);
    }
    return mutateSyllabusSnapshot((draft) => {
      draft.passingScoreThreshold = threshold;
    });
  },

  // ─── Utility ──────────────────────────────────────────────────────────────

  resolveOfferingId(termId: string, courseCatalogId: string): string {
    if (!IS_MOCK_MODE) return courseCatalogId;
    return buildCourseOfferingId(termId, courseCatalogId);
  },
};

export { DEFAULT_WEEK_WEIGHT, getAcademicYearOptions, isTermGateActive };
export type { EnrollmentSyllabusContext };
