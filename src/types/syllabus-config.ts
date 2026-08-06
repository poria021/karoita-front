export type SyllabusConfigSubTab = 'course_offerings' | 'term_settings';

export type AcademicTermType = 'semester' | 'modular';

export type CourseOfferingKind = 'internship' | 'apprenticeship';

export type SyllabusWeekStatus = 'active' | 'archived';

export type AcademicTerm = {
  id: string;
  title: string;
  type: AcademicTermType;
  isEnrollOpen: boolean;
  isTermOpen: boolean;
  enrollStart: string;
  termStart: string;
};

export type SyllabusWeek = {
  id: string;
  suffix: string;
  title: string;
  weight: number;
  status: SyllabusWeekStatus;
};

/** آیتم کاتالوگ درس — هویت پایدار `id`؛ عنوان فقط نمایش. */
export type CourseCatalogItem = {
  id: string;
  title: string;
  type: CourseOfferingKind;
};

/** ارائهٔ درس در یک ترم (Nest: courseOfferingId). */
export type CourseOfferingRecord = {
  id: string;
  termId: string;
  courseCatalogId: string;
  /** وضعیت ارائه برای کاربران — مستقل از سطرهای سرفصل. */
  isOffered: boolean;
  weeks: SyllabusWeek[];
};

export type CourseOfferingListItem = {
  courseOfferingId: string | null;
  courseCatalogId: string;
  title: string;
  type: CourseOfferingKind;
  isOffered: boolean;
};

export type MockInternshipRecord = {
  id: string;
  semester: string;
  title: string;
};

/**
 * Snapshot دامنه — بدون selectedTerm (انتخاب ترم فقط state کلاینت است).
 * offerings با کلید `courseOfferingId`.
 */
export type SyllabusConfigSnapshot = {
  terms: AcademicTerm[];
  offerings: Record<string, CourseOfferingRecord>;
  internships: MockInternshipRecord[];
  globalProfessorCapacity: number;
  passingScoreThreshold: number;
};

export type UpsertTermInput = {
  type: AcademicTermType;
  titlePrefix: string;
  academicYear: string;
};

export type ActivateOfferingInput = {
  termId: string;
  courseCatalogId: string;
};

export type DeactivateOfferingInput = {
  courseOfferingId: string;
};

export type SaveSyllabusWeeksInput = {
  courseOfferingId: string;
  /** برای upsert وقتی ارائه هنوز ساخته نشده (پیکربندی سرفصل قبل از فعال‌سازی). */
  termId: string;
  courseCatalogId: string;
  weeks: SyllabusWeek[];
};

export type UpdateTermGatesInput = {
  termId: string;
  isEnrollOpen?: boolean;
  isTermOpen?: boolean;
};
