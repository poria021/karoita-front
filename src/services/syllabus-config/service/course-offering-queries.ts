import { IS_MOCK_MODE } from '@/lib/api-mode';
import { courseDefinitionsOf } from '@/services/syllabus-config/course-catalog';
import {
  mockSyllabusSnapshot,
  readWeeksFromSnapshot,
} from '@/services/syllabus-config/mock/syllabus.fixtures';
import {
  getCatalogForTermType,
  listOfferingsForTerm,
} from '@/services/syllabus-config/syllabus-mappers';
import {
  getRealTermCourseContext,
  getRealWeeksForLesson,
  listRealCoursesForTerm,
  listRealOfferingsForTerm,
} from '@/services/syllabus-config/real/real-syllabus-reads';
import type {
  CourseCatalogItem,
  CourseOfferingListItem,
  LessonWeeksLoad,
} from '@/types/syllabus-config';

export const courseOfferingQueries = {
  /** `GET /admin/semesters_all` — درس و پرچم ارائه در یک رفت‌وبرگشت. */
  async listCoursesAndOfferingsForTerm(termId: string): Promise<{
    courses: CourseCatalogItem[];
    offerings: CourseOfferingListItem[];
  }> {
    if (!IS_MOCK_MODE) return getRealTermCourseContext(termId);
    const snapshot = mockSyllabusSnapshot();
    const term = snapshot.terms.find((t) => t.id === termId) ?? null;
    if (!term) return { courses: [], offerings: [] };
    return {
      courses: getCatalogForTermType(term.type, courseDefinitionsOf(snapshot)),
      offerings: listOfferingsForTerm(snapshot, termId),
    };
  },

  async listCoursesForTerm(termId: string): Promise<CourseCatalogItem[]> {
    if (!IS_MOCK_MODE) return listRealCoursesForTerm(termId);
    const snapshot = mockSyllabusSnapshot();
    const term = snapshot.terms.find((t) => t.id === termId) ?? null;
    if (!term) return [];
    return getCatalogForTermType(term.type, courseDefinitionsOf(snapshot));
  },

  /** در Nest پرچم ارائه همان `lesson.status` است. */
  async listOfferings(termId: string): Promise<CourseOfferingListItem[]> {
    if (!IS_MOCK_MODE) return listRealOfferingsForTerm(termId);
    return listOfferingsForTerm(mockSyllabusSnapshot(), termId);
  },

  async getWeeks(
    termId: string,
    courseCatalogId: string
  ): Promise<LessonWeeksLoad> {
    if (!IS_MOCK_MODE) {
      return getRealWeeksForLesson(termId, courseCatalogId);
    }
    const weeks = readWeeksFromSnapshot(
      mockSyllabusSnapshot(),
      termId,
      courseCatalogId
    );
    return {
      weeks,
      isPublished: weeks.length > 0,
      serverAlert: null,
    };
  },
};
