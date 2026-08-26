/**
 * Nest Admin catalog DTOs from
 * https://backenddev.darkube.ir/docs (OpenAPI 3).
 */
import type { AcademicTermType } from '@/types/syllabus-config';

/** Nest paginated admin-list envelope (e.g. GET /admin/provinces). No total count, only `hasNextPage`. */
export type NestPagedList<T> = {
  data: T[];
  hasNextPage: boolean;
};

export type NestProvince = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type NestCreateProvinceDto = {
  title: string;
};

/**
 * GET /admin/province/all row — confirmed live shape carries only
 * `{ id, title }`, unlike GET /admin/provinces which also returns
 * `createdAt`/`updatedAt`. Kept as its own type instead of reusing
 * `NestProvince` so callers don't assume timestamp fields that never
 * arrive on this endpoint.
 */
export type NestProvinceLite = Pick<NestProvince, 'id' | 'title'>;

export type NestUpdateProvinceDto = {
  title: string;
};

/**
 * GET responses from the live API nest `province` as an object (e.g.
 * `province: {}` or `province: { id, title }`), while the Swagger schema
 * doc and the POST/PATCH DTOs use a flat `province_id` string instead.
 * Keep both optional here and resolve defensively wherever this is read.
 */
export type NestCity = {
  id: string;
  title: string;
  province_id?: string;
  province?: { id?: string; title?: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type NestCreateCityDto = {
  title: string;
  province_id: string;
};

export type NestUpdateCityDto = {
  title?: string;
  /** Parent province — must be sent on edit or the city silently keeps its old province. */
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

/**
 * GET /admin/educations row. Confirmed live: rows nest `province`/`city`
 * as objects (`{ id, title }`, or `{}` when unlinked) — same shape as
 * NestCity/NestUniversity. The flat `provinceId`/`cityId` /
 * `province_id`/`city_id` variants are kept as defensive fallbacks since
 * the create/update DTOs use the flat shape.
 */
export type NestEducationalDistrict = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  province_id?: string;
  city_id?: string;
  province?: { id?: string; title?: string } | null;
  city?: { id?: string; title?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateSchoolDto = {
  provinceId: string;
  cityId: string;
  educationId: string;
  title: string;
  gender: string;
};

export type NestUpdateSchoolDto = {
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  title?: string;
  gender?: string;
};

/**
 * GET /admin/schools row. Same defensive pattern as NestEducationalDistrict
 * — `educationId` links a school to its educational district (رشته/ناحیه).
 *
 * Confirmed live quirk: the read row reports gender as `genderType`
 * (`"Boy"` / `"Girl"`), NOT `gender` — the create/update DTOs above use
 * `gender`, but the list/get response uses a different key entirely.
 * `gender` is kept here too as a defensive fallback in case that ever
 * changes server-side.
 */
export type NestSchool = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  /** Confirmed live field name on GET rows — see note above. */
  genderType?: string;
  gender?: string;
  province_id?: string;
  city_id?: string;
  education_id?: string;
  province?: { id?: string; title?: string } | null;
  city?: { id?: string; title?: string } | null;
  education?: { id?: string; title?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateDegreeDto = {
  roleId: string;
  title: string;
};

export type NestUpdateDegreeDto = {
  roleId?: string;
  title?: string;
};

/**
 * GET /admin/degreeee ("Get all degrees with role") — degree paired with
 * its linked role. Shape not pinned down by Swagger (live sample was an
 * empty array), so — same defensive pattern as toOrgCity/toOrgDistrict —
 * accept either a flat `roleId` or a nested `role` object.
 */
export type NestDegree = {
  id: string;
  title: string;
  roleId?: string;
  /** `title_fa` is the Persian display label — see NestRole / resolveRoleLabel(). */
  role?: { id?: string; title?: string; title_fa?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Nest Role (GET /admin/roles) — used to pick the `roleId` a degree links to.
 * Confirmed live shape is `{ id, title, title_fa }`: `title` is the English
 * role key (e.g. `"trainee"`) and `title_fa` is the Persian display label
 * (e.g. `"کارآموز"`). Both stay optional defensively — resolveRoleLabel()
 * in real-org-mappers.ts prefers `title_fa`, then `title`, then a short
 * id-based label, so the majors-tab role <select> never renders blank.
 */
export type NestRole = {
  id: string;
  title?: string;
  title_fa?: string;
};

/**
 * GET /admin/roles/{roleId}/degrees — degrees already scoped to one role by
 * the endpoint itself, so (unlike NestDegree from /admin/degreeee) there is
 * no `role`/`roleId` field on each row.
 */
export type NestDegreeByRole = {
  id: string;
  title: string;
};

export type NestCreateUniversityDto = {
  title: string;
  provinceId: string;
  cityId: string;
};

export type NestUpdateUniversityDto = {
  title?: string;
  provinceId?: string;
  cityId?: string;
};

/**
 * GET /admin/universites ('universites' matches the live OpenAPI path
 * spelling — see NEST_ADMIN_PATHS).
 *
 * Confirmed live quirk: the read row nests the linked province under the
 * key `role` (`role: { id, title }`, title being the province name e.g.
 * "تهران"), NOT `province` — almost certainly a copy-paste artifact in the
 * Nest serializer, but this is what the live API actually returns. `city`
 * is nested correctly under `city`. The flat `provinceId`/`cityId` (the
 * create/update DTO shape) and a correctly-named nested `province` are
 * kept as defensive fallbacks in case the backend fixes this later.
 */
export type NestUniversity = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  province?: { id?: string; title?: string } | null;
  city?: { id?: string; title?: string } | null;
  /** Confirmed live quirk — the province, mislabeled `role`. See note above. */
  role?: { id?: string; title?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * GET/POST/PATCH/DELETE `/admin/semester` — academic term (نیم‌سال/پودمان).
 * `structure` mirrors {@link AcademicTermType} 1:1. `season` has no display
 * label of its own on the Nest side — the term-settings form's prefix
 * select (نیم‌سال اول/دوم/تابستان, پودمان اول/دوم) encodes it instead; see
 * `real-syllabus-mappers.ts`. The live model carries no enroll/term "gate"
 * fields yet (isEnrollOpen/isTermOpen/enrollStart/termStart) — those stay
 * Nest-blocked.
 */
export type NestSemesterSeason = 'one' | 'two' | 'three';

export type NestSemester = {
  id: string;
  academicYear: string;
  season: NestSemesterSeason;
  structure: AcademicTermType;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateSemesterDto = {
  season: NestSemesterSeason;
  structure: AcademicTermType;
  academicYear: string;
};

/**
 * GET/POST `/admin/settings` — global academic settings. Nest has no PATCH
 * here: POST inserts a new row and GET always reads the latest one back.
 */
export type NestAcademicSettings = {
  id: string;
  systemPassingScore: number;
  generalProfessorCapacity: number;
};

export type NestUpdateSemesterDto = {
  season?: NestSemesterSeason;
  structure?: AcademicTermType;
  academicYear?: string;
};

export type NestCreateAcademicSettingsDto = {
  generalProfessorCapacity: number;
  systemPassingScore: number;
};

/**
 * پارامترهای pagination عمومی Nest Admin.
 * `filters` یک رشته query برای جستجوی عنوان است
 * (مطابق OpenAPI لایو: GET /admin/provinces?filters=...).
 */
export type NestAdminPageQuery = {
  page?: number;
  limit?: number;
  /** جستجو بر اساس عنوان — مطابق پارامتر `filters` در OpenAPI */
  filters?: string;
};

export type NestEducationListQuery = {
  provinceId?: string;
  cityId?: string;
  title?: string;
};

export type NestSchoolListQuery = {
  provinceId?: string;
  cityId?: string;
  educationId?: string;
  title?: string;
};
