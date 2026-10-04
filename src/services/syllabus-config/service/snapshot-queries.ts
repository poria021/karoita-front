import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  getAcademicYearOptions,
  mockSyllabusSnapshot,
  readWeeksFromSnapshot,
} from '@/services/syllabus-config/mock/syllabus.fixtures';
import {
  resolveEnrollmentSyllabusContext,
  type EnrollmentSyllabusContext,
} from '@/services/syllabus-config/syllabus-enrollment-reads';
import {
  buildCourseOfferingId,
  getCatalogForTermType,
  listOfferingsForTerm,
} from '@/services/syllabus-config/syllabus-mappers';
import { courseDefinitionsOf } from '@/services/syllabus-config/course-catalog';
import { catalogKindForTermType } from '@/services/syllabus-config/real/real-syllabus-mappers';
import { getRealSyllabusSnapshot } from '@/services/syllabus-config/real/real-syllabus-reads';
import type {
  AcademicTermType,
  CourseCatalogItem,
  CourseDefinition,
  CourseOfferingKind,
  CourseOfferingListItem,
  SyllabusConfigSnapshot,
  SyllabusWeek,
} from '@/types/syllabus-config';

export const snapshotQueries = {
  /** `GET /admin/semester` + `GET /admin/semesters_all` + `GET /admin/settings` */
  async getSnapshot(): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) {
      return getRealSyllabusSnapshot();
    }
    return mockSyllabusSnapshot();
  },

  /**
   * درس‌های فعال تعریف‌شدهٔ مدیر ارشد برای یک مخاطب، با زیرمجموعه‌هایشان.
   * خوانندهٔ مصرفی (سایدبار/ارزیابی) — گارد ادمین ندارد. در real تا آمدن API خالی
   * برمی‌گردد و مصرف‌کننده به فهرست پیش‌فرض برمی‌گردد.
   */
  getActiveCourseDefinitions(audience: AcademicTermType): CourseDefinition[] {
    if (!IS_MOCK_MODE) return [];
    return courseDefinitionsOf(mockSyllabusSnapshot()).filter(
      (course) => course.isActive && course.audience === audience
    );
  },

  /** تا آمدن endpoint واقعی سال تحصیلی، در حالت real لیست خالی برمی‌گرداند. */
  getAcademicYears(): string[] {
    if (!IS_MOCK_MODE) return [];
    return getAcademicYearOptions();
  },

  getDefaultAcademicYear(): string {
    if (!IS_MOCK_MODE) return '';
    return getAcademicYearOptions()[1] ?? getAcademicYearOptions()[0] ?? '';
  },

  /** تا آمدن route مصرف‌کننده در Nest خالی برمی‌گردد — throw نمی‌کند. */
  async getEnrollmentSyllabusContext(
    kind: CourseOfferingKind,
    level: number
  ): Promise<EnrollmentSyllabusContext> {
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
    return resolveEnrollmentSyllabusContext(mockSyllabusSnapshot(), kind, level);
  },

  async getPassingScoreThreshold(): Promise<number> {
    if (!IS_MOCK_MODE) {
      const snapshot = await getRealSyllabusSnapshot();
      return snapshot.passingScoreThreshold;
    }
    return mockSyllabusSnapshot().passingScoreThreshold;
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
      // صفر offering برای این ترم لزوماً یعنی «واقعاً درسی ندارد» نیست —
      // ممکن است ترم تازه ساخته شده و snapshot هنوز lesson/offering آن را
      // association نکرده باشد. اعتماد کورکورانه به این حالت باعث می‌شود
      // `loadTermContext` هیچ‌وقت `listCoursesAndOfferingsForTerm` (که واقعاً
      // `admin/semesters_all` را تازه می‌زند) صدا نزند و جدول درس‌ها خالی بماند.
      if (records.length === 0) {
        return null;
      }
      return { courses, offerings };
    }
    return {
      courses: getCatalogForTermType(term.type, courseDefinitionsOf(snapshot)),
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

  resolveOfferingId(termId: string, courseCatalogId: string): string {
    if (!IS_MOCK_MODE) return courseCatalogId;
    return buildCourseOfferingId(termId, courseCatalogId);
  },
};
