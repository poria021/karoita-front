/**
 * Nest Admin catalog DTOs from
 * https://backenddev.darkube.ir/docs (OpenAPI 3).
 */

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
  title: string;
};

export type NestCreateEducationalDistrictDto = {
  provinceId: string;
  /** Optional: provinces with no cities yield province-level districts. */
  cityId?: string;
  title: string;
};

export type NestUpdateEducationalDistrictDto = {
  provinceId?: string;
  cityId?: string;
  title?: string;
};

/**
 * GET /admin/educations row. Live GET responses have not been confirmed
 * (empty sample) — same defensive pattern as NestCity/NestUniversity:
 * accept either flat `provinceId`/`cityId` (the create/update DTO shape)
 * or `province_id`/`city_id`, or a nested `province`/`city` object.
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
 */
export type NestSchool = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  educationId?: string;
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
  role?: { id?: string; title?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Nest Role (GET /admin/roles) — used to pick the `roleId` a degree links to.
 * Confirmed live shape is bare `{ id }` — no `title`/`name` field is returned,
 * unlike `v1/auth/roles` (see nest-auth-role.ts). Keep `title` optional and
 * resolve a display fallback wherever this is read (see resolveRoleLabel in
 * org-structure.service.ts) rather than assuming it is always present.
 */
export type NestRole = {
  id: string;
  title?: string;
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
 * spelling — see NEST_ADMIN_PATHS). Live sample was an empty array (no
 * universities seeded yet), so — same defensive pattern as toOrgCity/
 * toOrgDistrict — accept either the flat `provinceId`/`cityId` the
 * create/update DTOs use, or a nested `province`/`city` object the way
 * GET /admin/cities is confirmed to return them.
 */
export type NestUniversity = {
  id: string;
  title: string;
  provinceId?: string;
  cityId?: string;
  province?: { id?: string; title?: string } | null;
  city?: { id?: string; title?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NestAdminPageQuery = {
  page?: number;
  limit?: number;
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
