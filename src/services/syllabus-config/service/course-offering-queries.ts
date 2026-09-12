import { IS_MOCK_MODE } from '@/lib/api-mode';
import { readSyllabusSnapshot, readWeeksFromSnapshot } from '@/services/syllabus-config/mock/mock-syllabus-store';
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

import { gateSyllabus } from './gates';

export const courseOfferingQueries = {
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
  ): Promise<LessonWeeksLoad> {
    gateSyllabus();
    if (!IS_MOCK_MODE) {
      return getRealWeeksForLesson(termId, courseCatalogId);
    }
    const weeks = readWeeksFromSnapshot(
      readSyllabusSnapshot(),
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
