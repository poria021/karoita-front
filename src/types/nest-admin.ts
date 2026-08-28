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
 * Nested / populated Nest relation. GET rows sometimes return the FK as a
 * plain id string and sometimes as the populated document (`{ id, title }`
 * or `{ _id, name }`). Display mappers must accept both — see
 * `nestRelationId` / `nestRelationTitle` in real-org-mappers.ts.
 */
export type NestNamedRef = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
};

/** FK that Nest may leave as a string or populate into a named ref. */
export type NestRelationId = string | NestNamedRef | null;

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
  province?: NestNamedRef | null;
  city?: NestNamedRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NestCreateSchoolDto = {
  provinceId: string;
  cityId: string;
  /** Required by live CreateSchoolDto. */
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
 * GET /admin/schools row. Confirmed live 200 (2026-08-28):
 *
 * ```
 * { id, title, createdAt, updatedAt, genderType,
 *   province: { id, title },
 *   city: { id, title } | {},
 *   education: {} }
 * ```
 *
 * Gender arrives as `genderType` (`"Boy"` / `"Girl"`), not `gender`.
 * `province` is populated. `city` is populated when a city was saved.
 * `education` stays `{}` and `educationId` is omitted on GET — recover
 * the district via `GET /admin/schools?educationId=`.
 */
export type NestSchool = {
  id: string;
  title: string;
  provinceId?: NestRelationId;
  cityId?: NestRelationId;
  /**
   * May arrive as a plain id OR a populated `{ id, title }` document.
   * When populated, the nested `education` object is often `{}` / absent —
   * the table must read the title off this field, not only `education.title`.
   */
  educationId?: NestRelationId;
  /** Confirmed live field name on GET rows — see note above. */
  genderType?: string;
  gender?: string;
  province_id?: NestRelationId;
  city_id?: NestRelationId;
  education_id?: NestRelationId;
  province?: NestNamedRef | null;
  city?: NestNamedRef | null;
  education?: NestNamedRef | null;
  /** Alternate serializer names seen on some Nest copies of this entity. */
  educationalDistrict?: NestNamedRef | null;
  district?: NestNamedRef | null;
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
 * Confirmed live 200 (2026-08-28):
 *
 * ```
 * { id, title, role: { id, title }, city: {} }
 * ```
 *
 * Province is nested under `role`, not `province` (serializer copy-paste).
 * `city` is an empty object and `cityId` is omitted — same gap as school
 * GET. Display falls back to a cities-by-province lookup only when a
 * `cityId` is present. Optional FK/nested fields stay so a backend fix
 * (populate `city` or return `cityId`) works without another mapper change.
 */
export type NestUniversity = {
  id: string;
  title: string;
  provinceId?: NestRelationId;
  cityId?: NestRelationId;
  city_id?: NestRelationId;
  province?: NestNamedRef | null;
  city?: NestNamedRef | null;
  /** Confirmed live quirk — the province, mislabeled `role`. See note above. */
  role?: NestNamedRef | null;
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
