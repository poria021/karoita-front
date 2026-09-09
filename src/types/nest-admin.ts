/**
 * DTOهای کاتالوگ ادمین Nest (OpenAPI لایو).
 * FK ممکن است id رشته یا سند populated باشد؛ املای مسیر (`universites`، `degreeee`) عمداً با لایو یکی است.
 */
import type { AcademicTermType } from '@/types/syllabus-config';

/** پاکت صفحه‌بندی ادمین (`{ data, hasNextPage }`)؛ total ندارد. */
export type NestPagedList<T> = {
  data: T[];
  hasNextPage: boolean;
};

/** GET /admin/provinces — شمارش‌های لایو `universityCount` / `educationalDistrictCount` / `schoolCount` / `userCount`. */
export type NestProvince = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  universityCount?: number;
  educationalDistrictCount?: number;
  schoolCount?: number;
  userCount?: number;
  usersCount?: number;
  users_count?: number;
};

export type NestCreateProvinceDto = {
  title: string;
};

/** ردیف GET /admin/province/all فقط id و title دارد؛ timestampهای NestProvince اینجا نمی‌آید. */
export type NestProvinceLite = Pick<NestProvince, 'id' | 'title'>;

export type NestUpdateProvinceDto = {
  title: string;
};

/** رابطهٔ populated یا id؛ mapper باید `{ id, title }` و `{ _id, name }` را بپذیرد. */
export type NestNamedRef = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
};

/** FK که Nest ممکن است رشته بگذارد یا به NestNamedRef populate کند. */
export type NestRelationId = string | NestNamedRef | null;

/** GET شهر: `province` آبجکت است (گاهی `{ id: null }`)؛ POST/PATCH از `province_id` تخت استفاده می‌کند. */
export type NestCity = {
  id: string;
  title: string;
  province_id?: string;
  province?: { id?: string | null; title?: string } | null;
  schoolCount?: number;
  userCount?: number;
  usersCount?: number;
  users_count?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateCityDto = {
  title: string;
  province_id: string;
};

export type NestUpdateCityDto = {
  title?: string;
  /** بدون `province_id` در ویرایش، Nest استان قبلی را بی‌خطا نگه می‌دارد. */
  province_id?: string;
};

export type NestCreateEducationalDistrictDto = {
  provinceId: string;
  /** cityId اختیاری — منطقه آموزشی روستایی ممکنه بدون شهر باشد. */
  cityId?: string;
  title: string;
};

export type NestUpdateEducationalDistrictDto = {
  provinceId?: string;
  cityId?: string;
  title?: string;
};

/** GET /admin/educations: `province`/`city` آبجکت‌اند؛ id تخت برای DTO نوشتن نگه داشته شده. */
export type NestEducationalDistrict = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  province_id?: string;
  city_id?: string;
  province?: NestNamedRef | null;
  city?: NestNamedRef | null;
  schoolCount?: number;
  userCount?: number;
  usersCount?: number;
  users_count?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateSchoolDto = {
  provinceId: string;
  /** اختیاری — مدرسه بدون شهر. */
  cityId?: string;
  /** اختیاری در نوشتن — مدرسه بدون منطقه. */
  educationId?: string;
  title: string;
  genderType: string;
};

export type NestUpdateSchoolDto = {
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  title?: string;
  genderType?: string;
};

/**
 * GET /admin/schools: آرایهٔ خام با `userCount` و `education` پرشده.
 * GET /admin/schools/all: پاکت `{ data, hasNextPage }`؛ `userCount` معمولاً نیست و رابطه ممکن است `{}` باشد.
 */
export type NestSchool = {
  id: string;
  title: string;
  provinceId?: NestRelationId;
  cityId?: NestRelationId;
  /** ممکن است id ساده یا `{ id, title }` باشد؛ عنوان را از همین فیلد بخوان نه فقط `education.title`. */
  educationId?: NestRelationId;
  /** نام فیلد لایو GET — نه `gender`. */
  genderType?: string;
  gender?: string;
  province_id?: NestRelationId;
  city_id?: NestRelationId;
  education_id?: NestRelationId;
  province?: NestNamedRef | null;
  city?: NestNamedRef | null;
  education?: NestNamedRef | null;
  /** نام‌های جایگزین serializer روی بعضی کپی‌های Nest. */
  educationalDistrict?: NestNamedRef | null;
  district?: NestNamedRef | null;
  userCount?: number;
  usersCount?: number;
  users_count?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateDegreeDto = {
  roleId: string;
  title: string;
};

/** PUT /admin/degree/{id} — بدنهٔ لایو `{ roleId, title }`. */
export type NestUpdateDegreeDto = {
  roleId: string;
  title: string;
};

/** GET /admin/degreeee: `role.title` کلید انگلیسی است؛ `title_fa` روی join نیست — از listRoles پر می‌شود. */
export type NestDegree = {
  id: string;
  title: string;
  roleId?: string;
  /** `title_fa` برچسب فارسی است — ببین NestRole / resolveRoleLabel(). */
  role?: { id?: string; title?: string; title_fa?: string } | null;
  createdAt?: string;
  updatedAt?: string;
  /** تا وقتی Nest شمارش کاربر برای قفل حذف بدهد اختیاری است. */
  usersCount?: number;
  userCount?: number;
  users_count?: number;
};

/** GET /admin/degreeee — `{ data, hasNextPage }` + page/limit/title. */
export type NestDegreeListQuery = {
  page?: number;
  limit?: number;
  title?: string;
};

/** GET /admin/roles: `title` کلید انگلیسی، `title_fa` برچسب فارسی؛ resolveRoleLabel اول `title_fa` را می‌گیرد. */
export type NestRole = {
  id: string;
  title?: string;
  title_fa?: string;
  userCount?: number;
  usersCount?: number;
  users_count?: number;
};

/** GET /admin/roles/{roleId}/degrees — برخلاف /admin/degreeee فیلد `role` ندارد. */
export type NestDegreeByRole = {
  id: string;
  title: string;
  usersCount?: number;
  userCount?: number;
  users_count?: number;
};

export type NestCreateUniversityDto = {
  title: string;
  provinceId: string;
  /** بدون `cityId` لایو ۴۲۲ می‌دهد؛ UI فیلد را پنهان می‌کند و سرویس پر می‌کند. */
  cityId: string;
};

export type NestUpdateUniversityDto = {
  title?: string;
  provinceId?: string;
  cityId?: string;
};

/** GET /admin/universites (املای لایو). استان زیر `role` است نه `province`؛ `city` خالی است. */
export type NestUniversity = {
  id: string;
  title: string;
  provinceId?: NestRelationId;
  cityId?: NestRelationId;
  city_id?: NestRelationId;
  province?: NestNamedRef | null;
  city?: NestNamedRef | null;
  /** رفتار لایو — استان با برچسب اشتباه `role`. */
  role?: NestNamedRef | null;
  createdAt?: string;
  updatedAt?: string;
  /** تا وقتی Nest شمارش کاربر برای قفل حذف بدهد اختیاری است. */
  usersCount?: number;
  userCount?: number;
  users_count?: number;
};

/**
 * نیم‌سال/پودمان. گیت انتخاب‌واحد/کلاس روی خود ترم است.
 * خواندن و نوشتن پودمانی املای لایو `podmani` است (نه `modular`).
 * GET `/admin/semesters_all` ممکن است `academicYears` جمع باشد و گیت را ندهد —
 * آن‌ها را از GET `/admin/semester` بخوان. PATCH ممکن است سند خام mongoose بدهد.
 */
export type NestSemesterSeason = 'one' | 'two' | 'three';

/**
 * مقدار `structure` در POST/PATCH `/admin/semester` و کوئری
 * GET `/admin/semesters_all?structure=` — `podmani` املای لایو است.
 */
export type NestSemesterAllStructure = 'semester' | 'podmani';

export type NestSemester = {
  id: string;
  _id?: string;
  academicYear?: string;
  academicYears?: string;
  season: NestSemesterSeason;
  /** خواندن ممکن است ردیف قدیمی `modular` هم بدهد؛ نوشتن فقط `podmani`. */
  structure: AcademicTermType | NestSemesterAllStructure;
  courseSelection?: boolean;
  startClasses?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NestLessonWeek = {
  id?: string;
  _id?: string;
  lessonId?: string;
  /** ضریب اهمیت ۱…۵ — نه شماره هفته. */
  priority?: number;
  status?: boolean;
  title?: string;
};

export type NestLesson = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  title_fa?: string;
  semesterId?: string;
  startClasses?: boolean;
  courseSelection?: boolean;
  status?: boolean;
  capacity?: number;
  days?: number[];
  weeks?: NestLessonWeek[];
};

/** ردیف GET `/admin/semesters_all` — نیم‌سال به‌همراه درس/هفتهٔ تو در تو. */
export type NestSemesterWithLessons = NestSemester & {
  lessons?: NestLesson[];
};

export type NestPatchLessonStatusDto = {
  status?: boolean;
  capacity?: number;
  days?: number[];
};

/**
 * ردیف GET `/admin/professor-capacities`.
 * `days`: ۰=شنبه … ۵=پنجشنبه.
 */
export type NestProfessorCapacity = {
  id?: string;
  _id?: string;
  professorId: string;
  lessonId: string;
  semesterId: string;
  days?: number[];
  capacity?: number;
};

/** بدنهٔ POST/PUT `/admin/professor-capacities` — آرایه. */
export type NestProfessorCapacityWriteDto = {
  professorId: string;
  lessonId: string;
  semesterId: string;
  days: number[];
  capacity: number;
};

export type NestProfessorCapacitiesQuery = {
  lessonId?: string;
  semesterId?: string;
};

/**
 * آیتم PATCH `/admin/lessons/status` (آرایه).
 * `capacity` نباید از آخرین `generalProfessorCapacity` بیشتر باشد (اگر تنظیمات خالی باشد سقف لایو ۱۵ است).
 * `days`: ۰=شنبه … ۵=پنجشنبه؛ یکتا.
 */
export type NestUpdateLessonItemDto = {
  id: string;
  status?: boolean;
  capacity?: number;
  days?: number[];
};

export type NestPutLessonWeeksDto = {
  weeks: Array<{ priority: number; status: boolean }>;
};

export type NestCreateWeekDto = {
  lessonId: string;
  /** ضریب اهمیت ۱…۵؛ ترتیب هفته ایندکس آرایه است. */
  priority: number;
  status: boolean;
};

/** PATCH `/admin/weeks/{id}` — لایو ۲۰۴؛ `lessonId` نفرست (forbidNonWhitelisted). */
export type NestUpdateWeekDto = {
  lessonId?: string;
  priority?: number;
  status?: boolean;
};

/** POST `/admin/semester` — لایو ۲۰۴ می‌دهد؛ بدنه باید کامل باشد. */
export type NestCreateSemesterDto = {
  season: NestSemesterSeason;
  structure: NestSemesterAllStructure;
  academicYear: string;
  courseSelection: boolean;
  startClasses: boolean;
};

/**
 * PATCH `/admin/semester/{id}` — لایو بدنهٔ کامل می‌خواهد (هویت + گیت).
 * پاسخ ممکن است ۲۰۴ یا سند خام mongoose باشد؛ بعد از نوشته GET بزن.
 */
export type NestUpdateSemesterDto = NestCreateSemesterDto;

/**
 * GET/POST `/admin/settings` — PATCH ندارد؛ POST ردیف جدید می‌گذارد (لایو ۲۰۴) و GET آخرین را می‌خواند.
 */
export type NestAcademicSettings = {
  id: string;
  systemPassingScore: number;
  generalProfessorCapacity: number;
};

/** POST `/admin/settings` — هر دو فیلد اجباری‌اند. */
export type NestCreateAcademicSettingsDto = {
  generalProfessorCapacity: number;
  systemPassingScore: number;
};

/** صفحه‌بندی ادمین؛ `filters` رشتهٔ جستجوی عنوان است (GET /admin/provinces?filters=). */
export type NestAdminPageQuery = {
  page?: number;
  limit?: number;
  /** جستجو بر اساس عنوان — مطابق پارامتر `filters` در OpenAPI */
  filters?: string;
};

export type NestEducationListQuery = {
  page?: number;
  limit?: number;
  provinceId?: string;
  cityId?: string;
  title?: string;
};

export type NestSchoolListQuery = {
  page?: number;
  limit?: number;
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  title?: string;
};

export type NestUniversityListQuery = {
  page?: number;
  limit?: number;
  title?: string;
};

/** Envelope `{ data, hasNextPage }` — یا آرایهٔ خام قدیمی اگر Nest هنوز آن را بدهد. */
export function parseNestPagedList<T>(raw: unknown): NestPagedList<T> {
  if (Array.isArray(raw)) {
    return { data: raw as T[], hasNextPage: false };
  }
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    if (Array.isArray(rec.data)) {
      return {
        data: rec.data as T[],
        hasNextPage: Boolean(rec.hasNextPage),
      };
    }
  }
  return { data: [], hasNextPage: false };
}

/**
 * مثل `parseNestPagedList`، ولی اگر لایو آرایهٔ کامل بدهد (GET /admin/schools)
 * صفحه را سمت کلاینت می‌بُرد تا infinite scroll گیر نکند.
 */
export function parseNestMaybePagedList<T>(
  raw: unknown,
  page?: number,
  limit?: number
): NestPagedList<T> {
  if (Array.isArray(raw) && limit && limit > 0) {
    const safePage = Math.max(1, page ?? 1);
    const start = (safePage - 1) * limit;
    const slice = raw.slice(start, start + limit) as T[];
    return {
      data: slice,
      hasNextPage: start + slice.length < raw.length,
    };
  }
  return parseNestPagedList<T>(raw);
}
