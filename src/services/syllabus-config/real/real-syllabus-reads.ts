import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { ApiClientError } from '@/services/api-error';
import {
  DEFAULT_WEEK_WEIGHT,
  getTodayJalaliSlash,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import {
  lessonsOfTerm,
  mergeTermsWithLessonBundles,
  parseNestAcademicSettings,
  parseNestLessonWeeksGet,
  parseNestSemester,
  parseNestSemesterBundle,
  parseNestSemesterList,
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
  LessonWeeksLoad,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';
import type { NestSemesterWithLessons } from '@/types/nest-admin';

export type { RealAcademicSettings };

/** `GET /admin/semester` — آرایهٔ خام، بدون پاکت paging. */
export async function listRealTerms(): Promise<AcademicTerm[]> {
  const rows = parseNestSemesterList(await adminCatalogApi.listSemesters());
  return rows.map((row) => toAcademicTerm(row));
}

export async function getRealTerm(id: string): Promise<AcademicTerm> {
  const row = parseNestSemester(await adminCatalogApi.getSemester(id), id);
  if (!row) {
    throw new ApiClientError('دوره تحصیلی یافت نشد.', 404);
  }
  return toAcademicTerm(row);
}

export async function listRealSemesterBundles(): Promise<
  NestSemesterWithLessons[]
> {
  const [semester, podmani] = await Promise.all([
    adminCatalogApi.listSemestersAll('semester'),
    adminCatalogApi.listSemestersAll('podmani'),
  ]);
  const bundles: NestSemesterWithLessons[] = [];
  for (const row of [...semester, ...podmani]) {
    const parsed = parseNestSemesterBundle(row);
    if (parsed) bundles.push(parsed);
  }
  return bundles;
}

/**
 * `GET /admin/settings` — آخرین ردیف درج‌شده.
 * اگر مجموعه خالی باشد (قبل از اولین POST) به پیش‌فرض امن برمی‌گردیم.
 */
export async function getRealAcademicSettings(): Promise<RealAcademicSettings> {
  try {
    const parsed = parseNestAcademicSettings(
      await adminCatalogApi.getAcademicSettings()
    );
    if (!parsed) {
      return { globalProfessorCapacity: 0, passingScoreThreshold: 0 };
    }
    return toAcademicSettings(parsed);
  } catch {
    // Nest وقتی ردیف تنظیمات نیست ۴۰۴/۵۰۰ می‌دهد — پیش‌فرض برگردان.
    return { globalProfessorCapacity: 0, passingScoreThreshold: 0 };
  }
}

/**
 * snapshot واقعی: ترم و گیت از `GET /admin/semester`، ارائه از `GET /admin/semesters_all`.
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
 * `GET /admin/weeks/lesson/{lessonId}` منبع قفل ساختار است.
 * خالی = هنوز پیکربندی نشده؛ غیرخالی = فقط بایگانی.
 */
export async function getRealWeeksForLesson(
  _termId: string,
  lessonId: string
): Promise<LessonWeeksLoad> {
  const parsed = parseNestLessonWeeksGet(
    await adminCatalogApi.listWeeksByLesson(lessonId)
  );
  if (parsed.serverAlert && !parsed.isPublished) {
    throw new ApiClientError(parsed.serverAlert);
  }
  return {
    weeks: parsed.weeks.map((week, index) =>
      toSyllabusWeek(week, index, DEFAULT_WEEK_WEIGHT)
    ),
    isPublished: parsed.isPublished,
    serverAlert: parsed.isPublished ? parsed.serverAlert : null,
  };
}
