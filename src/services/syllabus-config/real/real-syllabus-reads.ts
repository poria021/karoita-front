import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  DEFAULT_WEEK_WEIGHT,
  getTodayJalaliSlash,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import {
  lessonsOfTerm,
  mergeTermsWithLessonBundles,
  toAcademicSettings,
  toAcademicTerm,
  toCourseCatalogItem,
  toCourseOfferingListItem,
  toSyllabusWeek,
  type RealAcademicSettings,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import type {
  AcademicTerm,
  CourseCatalogItem,
  CourseOfferingListItem,
  SyllabusConfigSnapshot,
  SyllabusWeek,
} from '@/types/syllabus-config';
import type { NestSemesterWithLessons } from '@/types/nest-admin';

export type { RealAcademicSettings };

/** GET /admin/semester — bare array, no paging envelope. */
export async function listRealTerms(): Promise<AcademicTerm[]> {
  const rows = await adminCatalogApi.listSemesters();
  return rows.map((row) => toAcademicTerm(row));
}

/** GET /admin/semester/{id} */
export async function getRealTerm(id: string): Promise<AcademicTerm> {
  const row = await adminCatalogApi.getSemester(id);
  return toAcademicTerm(row);
}

export async function listRealSemesterBundles(): Promise<
  NestSemesterWithLessons[]
> {
  const [semester, podmani] = await Promise.all([
    adminCatalogApi.listSemestersAll('semester'),
    adminCatalogApi.listSemestersAll('podmani'),
  ]);
  return [...semester, ...podmani];
}

/**
 * GET /admin/settings — latest inserted row.
 * Falls back to safe defaults when the settings collection is still empty
 * (first-time setup before any POST /admin/settings call).
 */
export async function getRealAcademicSettings(): Promise<RealAcademicSettings> {
  try {
    const settings = await adminCatalogApi.getAcademicSettings();
    return toAcademicSettings(settings);
  } catch {
    // Nest returns 404/500 when no settings row exists yet — return defaults.
    return { globalProfessorCapacity: 0, passingScoreThreshold: 0 };
  }
}

/**
 * Composite snapshot for real mode: terms from GET /admin/semester, overlay
 * lesson gates/offerings from GET /admin/semesters_all.
 */
export async function getRealSyllabusSnapshot(): Promise<SyllabusConfigSnapshot> {
  const [listedTerms, bundles, settings] = await Promise.all([
    listRealTerms(),
    listRealSemesterBundles(),
    getRealAcademicSettings(),
  ]);
  const { terms, offerings } = mergeTermsWithLessonBundles(
    listedTerms,
    bundles,
    getTodayJalaliSlash(),
    DEFAULT_WEEK_WEIGHT
  );
  return {
    terms,
    offerings,
    internships: [],
    globalProfessorCapacity: settings.globalProfessorCapacity,
    passingScoreThreshold: settings.passingScoreThreshold,
  };
}

export async function getRealTermCourseContext(termId: string): Promise<{
  courses: CourseCatalogItem[];
  offerings: CourseOfferingListItem[];
}> {
  const scoped = lessonsOfTerm(await listRealSemesterBundles(), termId);
  if (!scoped) return { courses: [], offerings: [] };
  const courses: CourseCatalogItem[] = [];
  const offerings: CourseOfferingListItem[] = [];
  for (const lesson of scoped.lessons) {
    const catalog = toCourseCatalogItem(lesson, scoped.termType);
    if (!catalog) continue;
    courses.push(catalog);
    const offering = toCourseOfferingListItem(lesson, scoped.termType);
    if (offering) offerings.push(offering);
  }
  return { courses, offerings };
}

export async function listRealCoursesForTerm(
  termId: string
): Promise<CourseCatalogItem[]> {
  const { courses } = await getRealTermCourseContext(termId);
  return courses;
}

export async function listRealOfferingsForTerm(
  termId: string
): Promise<CourseOfferingListItem[]> {
  const { offerings } = await getRealTermCourseContext(termId);
  return offerings;
}

/**
 * GET /admin/weeks/lesson/{lessonId}. If the dedicated list is empty, fall
 * back to weeks nested on GET /admin/semesters_all (some Nest copies omit
 * them from the lesson-scoped route until a PUT has round-tripped).
 */
export async function getRealWeeksForLesson(
  termId: string,
  lessonId: string
): Promise<SyllabusWeek[]> {
  const rows = await adminCatalogApi.listWeeksByLesson(lessonId);
  if (rows.length > 0) {
    return rows.map((week, index) =>
      toSyllabusWeek(week, index, DEFAULT_WEEK_WEIGHT)
    );
  }
  const scoped = lessonsOfTerm(await listRealSemesterBundles(), termId);
  const lesson = scoped?.lessons.find(
    (item) => (item.id || item._id) === lessonId
  );
  return (lesson?.weeks ?? []).map((week, index) =>
    toSyllabusWeek(week, index, DEFAULT_WEEK_WEIGHT)
  );
}

export async function findRealLessonIdsForTerm(
  termId: string
): Promise<string[]> {
  const scoped = lessonsOfTerm(await listRealSemesterBundles(), termId);
  if (!scoped) return [];
  return scoped.lessons
    .map((lesson) => lesson.id || lesson._id || '')
    .filter(Boolean);
}
