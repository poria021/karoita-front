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
  /** از `season` + `structure` Nest؛ برای فرم ویرایش تا title را پارس نکنیم. */
  titlePrefix?: string;
  /** سال نرمال‌شدهٔ `YYYY-YYYY` از `academicYear` / `academicYears`. */
  academicYear?: string;
};

export type SyllabusWeek = {
  id: string;
  suffix: string;
  title: string;
  weight: number;
  status: SyllabusWeekStatus;
};

/**
 * GET `/admin/weeks/lesson/{id}` خالی = پیکربندی اول (افزودن/حذف).
 * اگر هفته برگردد ساختار قفل است و فقط بایگانی/بازیابی مجاز است.
 */
export type LessonWeeksLoad = {
  weeks: SyllabusWeek[];
  isPublished: boolean;
  /** متن خطا/هشدار خود پاسخ GET، اگر پاکت داشته باشد. */
  serverAlert: string | null;
};

/** آیتم کاتالوگ درس — هویت پایدار `id`؛ عنوان فقط نمایش. */
export type CourseCatalogItem = {
  id: string;
  title: string;
  type: CourseOfferingKind;
  /** وقتی آیتم زیرمجموعهٔ یک درس است؛ درس مستقل این دو را ندارد. */
  groupId?: string;
  groupTitle?: string;
};

/** زیرمجموعهٔ درس (مثل «کارورزی ۱») — هر کدام یک ماژول قابل ارائه است. */
export type CourseSubModule = {
  id: string;
  title: string;
  /**
   * سطح عددی پایدار برای مسیر/داده‌ی ثبت‌نام mock (`/internships/:level`).
   * leaf های seed (`course_*_N`) ندارند و همان N هستند؛ leaf تازه از ۱۰۱ به بالا می‌گیرد.
   */
  level?: number;
};

/**
 * درسی که مدیر ارشد تعریف می‌کند.
 * با زیرمجموعه = فقط عنوان گروه است و زیرمجموعه‌ها ارائه می‌شوند؛
 * بدون زیرمجموعه = خود درس یک ماژول مستقل است.
 * `audience` تعیین می‌کند درس در پنل کارورزی (ترمی) یا کارآموزی (پودمانی) باشد.
 */
export type CourseDefinition = {
  id: string;
  title: string;
  audience: AcademicTermType;
  isActive: boolean;
  subModules: CourseSubModule[];
  /** سطح ثبت‌نام وقتی درس زیرمجموعه ندارد و خودش leaf است (مثل `CourseSubModule.level`). */
  level?: number;
};

export type UpsertCourseDefinitionInput = {
  title: string;
  audience: AcademicTermType;
  isActive: boolean;
  /** `id` برای زیرمجموعهٔ موجود؛ ردیف تازه بدون `id` می‌آید. */
  subModules: Array<{ id?: string; title: string }>;
};

/** ارائهٔ درس در یک ترم (Nest: courseOfferingId / lesson id). */
export type CourseOfferingRecord = {
  id: string;
  termId: string;
  courseCatalogId: string;
  /** روی درس واقعی Nest می‌آید؛ کاتالوگ mock وقتی نیست عنوان می‌دهد. */
  title?: string;
  type?: CourseOfferingKind;
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
  /** کاتالوگ دروس داینامیک (فعلاً فقط mock). نبودنش = seed پیش‌فرض کارورزی/کارآموزی. */
  courseCatalog?: CourseDefinition[];
  /** آخرین سطح ثبت‌نامِ داده‌شده به leaf داینامیک؛ شمارنده‌ی یکنوا تا سطح حذف‌شده دوباره استفاده نشود. */
  courseLevelSeq?: number;
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
