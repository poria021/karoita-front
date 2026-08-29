import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestAcademicSettings,
  NestAdminPageQuery,
  NestCity,
  NestCreateAcademicSettingsDto,
  NestCreateCityDto,
  NestCreateDegreeDto,
  NestCreateEducationalDistrictDto,
  NestCreateProvinceDto,
  NestCreateSchoolDto,
  NestBulkLessonStatusDto,
  NestCreateSemesterDto,
  NestCreateUniversityDto,
  NestCreateWeekDto,
  NestDegree,
  NestDegreeByRole,
  NestEducationalDistrict,
  NestEducationListQuery,
  NestPagedList,
  NestProvince,
  NestProvinceLite,
  NestRole,
  NestSchool,
  NestSchoolListQuery,
  NestLessonWeek,
  NestPatchLessonStatusDto,
  NestPutLessonWeeksDto,
  NestSemester,
  NestSemesterAllStructure,
  NestSemesterWithLessons,
  NestUniversity,
  NestUniversityListQuery,
  NestUpdateCityDto,
  NestUpdateDegreeDto,
  NestUpdateEducationalDistrictDto,
  NestUpdateProvinceDto,
  NestUpdateSchoolDto,
  NestUpdateSemesterDto,
  NestUpdateUniversityDto,
  NestUpdateWeekDto,
} from '@/types/nest-admin';

/**
 * Relative to NEXT_PUBLIC_API_URL (`.../api`).
 * Source: https://backenddev.darkube.ir/docs — Admin tag.
 * Spellings `universites` and `degreeee` match live OpenAPI paths.
 */
export const NEST_ADMIN_PATHS = {
  provinces: 'admin/provinces',
  provincesAll: 'admin/province/all',
  provinceById: (id: string) => `admin/provinces/${id}`,
  provinceCities: (id: string) => `admin/provinces/${id}/cities`,
  cities: 'admin/cities',
  cityById: (id: string) => `admin/cities/${id}`,
  educations: 'admin/educations',
  educationById: (id: string) => `admin/educations/${id}`,
  cityEducations: (id: string) => `admin/cities/${id}/educations`,
  provinceEducations: (id: string) => `admin/province/${id}/educations`,
  schools: 'admin/schools',
  schoolsAll: 'admin/schools/all',
  schoolById: (id: string) => `admin/schools/${id}`,
  /**
   * Confirmed live quirk: DELETE has no `/` before the id
   * (`admin/schools{id}`, not `admin/schools/{id}`) — verified against a
   * live 204 response. PUT/update uses the normal slash-separated path
   * above; only DELETE is affected.
   */
  schoolDeleteById: (id: string) => `admin/schools${id}`,
  degree: 'admin/degree',
  degreeById: (id: string) => `admin/degree/${id}`,
  degreesWithRole: 'admin/degreeee',
  roles: 'admin/roles',
  roleDegrees: (roleId: string) => `admin/roles/${roleId}/degrees`,
  universities: 'admin/universites',
  universityById: (id: string) => `admin/universites/${id}`,
  semesters: 'admin/semester',
  semesterById: (id: string) => `admin/semester/${id}`,
  semestersAll: 'admin/semesters_all',
  lessonsStatus: 'admin/lessons/status',
  lessonStatusById: (id: string) => `admin/lessons/${id}/status`,
  lessonWeeks: (lessonId: string) => `admin/lessons/${lessonId}/weeks`,
  weeks: 'admin/weeks',
  weekById: (id: string) => `admin/weeks/${id}`,
  weeksByLesson: (lessonId: string) => `admin/weeks/lesson/${lessonId}`,
  academicSettings: 'admin/settings',
} as const;

/**
 * GET /admin/provinces and GET /admin/cities are the same generated CRUD
 * controller shape: `filters` must arrive as a JSON object-string
 * (`{"title":"..."}`), not a bare string — confirmed live for provinces.
 * Shared so both call sites stay in sync.
 */
function toNestTitleFilterSearchParams(query: NestAdminPageQuery) {
  const { filters, ...rest } = query;
  return toSearchParams({
    ...rest,
    ...(filters ? { filters: JSON.stringify({ title: filters }) } : {}),
  });
}

export const adminCatalogApi = {
  createProvince(body: NestCreateProvinceDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.provinces, body, token);
  },
  /** GET /admin/provinces — paginated envelope `{ data, hasNextPage }`, no total count.
   * Nest انتظار دارد `filters` یک JSON object-string باشه: {"title":"..."}
   */
  listProvinces(query: NestAdminPageQuery = {}, token?: string) {
    return apiClient.getJson<NestPagedList<NestProvince>>(
      NEST_ADMIN_PATHS.provinces,
      token,
      { searchParams: toNestTitleFilterSearchParams(query) }
    );
  },
  /** GET /admin/province/all?title= — bare array, no paging envelope, no createdAt/updatedAt on rows. */
  getAllProvinces(title?: string, token?: string) {
    return apiClient.getJson<NestProvinceLite[]>(
      NEST_ADMIN_PATHS.provincesAll,
      token,
      { searchParams: toSearchParams({ title }) }
    );
  },
  updateProvince(id: string, body: NestUpdateProvinceDto, token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.provinceById(id),
      body,
      token
    );
  },
  deleteProvince(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_ADMIN_PATHS.provinceById(id), token);
  },

  createCity(body: NestCreateCityDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.cities, body, token);
  },
  /** GET /admin/cities — paginated envelope `{ data, hasNextPage }`, same generated-controller
   * shape as provinces — `filters` gets the same JSON-object-string treatment. */
  listCities(query: NestAdminPageQuery = {}, token?: string) {
    return apiClient.getJson<NestPagedList<NestCity>>(NEST_ADMIN_PATHS.cities, token, {
      searchParams: toNestTitleFilterSearchParams(query),
    });
  },
  getCity(id: string, token?: string) {
    return apiClient.getJson<NestCity>(NEST_ADMIN_PATHS.cityById(id), token);
  },
  updateCity(id: string, body: NestUpdateCityDto, token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.cityById(id),
      body,
      token
    );
  },
  deleteCity(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_ADMIN_PATHS.cityById(id), token);
  },
  listCitiesByProvince(provinceId: string, token?: string) {
    return apiClient.getJson<NestCity[]>(
      NEST_ADMIN_PATHS.provinceCities(provinceId),
      token
    );
  },

  createEducation(body: NestCreateEducationalDistrictDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.educations, body, token);
  },
  /** GET /admin/educations — `{ data, hasNextPage }` + page/limit/provinceId/cityId/title. */
  async listEducations(query: NestEducationListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.educations,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestEducationalDistrict>(raw);
  },
  listEducationsByCity(cityId: string, token?: string) {
    return apiClient.getJson<NestEducationalDistrict[]>(
      NEST_ADMIN_PATHS.cityEducations(cityId),
      token
    );
  },
  listEducationsByProvince(provinceId: string, token?: string) {
    return apiClient.getJson<NestEducationalDistrict[]>(
      NEST_ADMIN_PATHS.provinceEducations(provinceId),
      token
    );
  },
  /**
   * PUT /admin/educations/{id} — برخی پاسخ‌ها بدون بدنه (۲۰۴/۲۰۰ خالی) برمی‌گردند — باید
   * از putMaybeJson استفاده شود ونه putJson (وگرنه parse خطای
   * «Unexpected end of JSON input» می‌دهد حتی وقتی به‌موفقیت ذخیره شده).
   */
  updateEducation(
    id: string,
    body: NestUpdateEducationalDistrictDto,
    token?: string
  ) {
    return apiClient.putMaybeJson<unknown>(
      NEST_ADMIN_PATHS.educationById(id),
      body,
      token
    );
  },
  deleteEducation(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.educationById(id),
      token
    );
  },

  createSchool(body: NestCreateSchoolDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.schools, body, token);
  },
  /** GET /admin/schools/all — `{ data, hasNextPage }` + page/limit + parent filters. */
  async listSchools(query: NestSchoolListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.schoolsAll,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestSchool>(raw);
  },
  /**
   * PUT /admin/schools/{id} — مشابه educations/universities/degree، پاسخ ممکنه
   * بدون بدنه برگردد — putMaybeJson از خطای «Unexpected end of JSON
   * input» روی فرم ویرایش مدرسه جلوگیری می‌کند.
   */
  updateSchool(id: string, body: NestUpdateSchoolDto, token?: string) {
    return apiClient.putMaybeJson<unknown>(NEST_ADMIN_PATHS.schoolById(id), body, token);
  },
  /** DELETE /admin/schools{id} — see `schoolDeleteById` above for the missing-slash quirk. */
  deleteSchool(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.schoolDeleteById(id),
      token
    );
  },

  /**
   * POST /admin/degree — مشابه update‌های بالا، پاسخ ممکنه بدون بدنه برگردد
   * — postMaybeJson از همان خطای پارس JSON خالی جلوگیری می‌کند.
   */
  createDegree(body: NestCreateDegreeDto, token?: string) {
    return apiClient.postMaybeJson<unknown>(NEST_ADMIN_PATHS.degree, body, token);
  },
  /** GET /admin/degreeee — bare array, degree rows paired with their linked role. */
  listDegrees(title?: string, token?: string) {
    return apiClient.getJson<NestDegree[]>(
      NEST_ADMIN_PATHS.degreesWithRole,
      token,
      { searchParams: toSearchParams({ title }) }
    );
  },
  updateDegree(id: string, body: NestUpdateDegreeDto, token?: string) {
    return apiClient.putMaybeJson<unknown>(NEST_ADMIN_PATHS.degreeById(id), body, token);
  },
  deleteDegree(id: string, token?: string) {
    return apiClient.deleteMaybeJson<unknown>(
      NEST_ADMIN_PATHS.degreeById(id),
      token
    );
  },

  listRoles(token?: string) {
    return apiClient.getJson<NestRole[]>(NEST_ADMIN_PATHS.roles, token);
  },
  /** GET /admin/roles/{roleId}/degrees — degrees already scoped to that role. */
  listDegreesByRole(roleId: string, token?: string) {
    return apiClient.getJson<NestDegreeByRole[]>(
      NEST_ADMIN_PATHS.roleDegrees(roleId),
      token
    );
  },

  createUniversity(body: NestCreateUniversityDto, token?: string) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.universities,
      body,
      token
    );
  },
  /** GET /admin/universites — `{ data, hasNextPage }` + page/limit/title. */
  async listUniversities(
    query: NestUniversityListQuery = {},
    token?: string
  ) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.universities,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestUniversity>(raw);
  },
  updateUniversity(id: string, body: NestUpdateUniversityDto, token?: string) {
    return apiClient.putMaybeJson<unknown>(
      NEST_ADMIN_PATHS.universityById(id),
      body,
      token
    );
  },
  deleteUniversity(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.universityById(id),
      token
    );
  },

  createSemester(body: NestCreateSemesterDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.semesters, body, token);
  },
  /** GET /admin/semester — bare array, no paging envelope. */
  listSemesters(token?: string) {
    return apiClient.getJson<NestSemester[]>(NEST_ADMIN_PATHS.semesters, token);
  },
  /** GET /admin/semester/{id} — `{ id, academicYear, season, structure }`. */
  getSemester(id: string, token?: string) {
    return apiClient.getJson<NestSemester>(
      NEST_ADMIN_PATHS.semesterById(id),
      token
    );
  },
  /**
   * PATCH /admin/semester/{id}
   * Live 200 is a raw Mongoose document, not NestSemester — ignore the body
   * and re-GET the row after write.
   */
  updateSemester(id: string, body: NestUpdateSemesterDto, token?: string) {
    return apiClient.patchMaybeJson<unknown>(
      NEST_ADMIN_PATHS.semesterById(id),
      body,
      token
    );
  },
  deleteSemester(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.semesterById(id),
      token
    );
  },

  /**
   * GET /admin/semesters_all?structure=semester|podmani
   * Bare array of semesters with nested lessons (and sometimes weeks).
   */
  listSemestersAll(structure: NestSemesterAllStructure, token?: string) {
    return apiClient.getJson<NestSemesterWithLessons[]>(
      NEST_ADMIN_PATHS.semestersAll,
      token,
      { searchParams: toSearchParams({ structure }) }
    );
  },

  /** GET /admin/weeks/lesson/{lessonId} — bare week array. */
  listWeeksByLesson(lessonId: string, token?: string) {
    return apiClient.getJson<NestLessonWeek[]>(
      NEST_ADMIN_PATHS.weeksByLesson(lessonId),
      token
    );
  },

  /**
   * PATCH /admin/lessons/status — bulk capacity / days / status flags.
   * Confirmed live 204.
   */
  patchLessonsStatus(body: NestBulkLessonStatusDto[], token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonsStatus,
      body,
      token
    );
  },

  /**
   * PATCH /admin/lessons/{id}/status — single lesson flags / capacity / days.
   * Confirmed live 204.
   */
  patchLessonStatus(
    id: string,
    body: NestPatchLessonStatusDto,
    token?: string
  ) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonStatusById(id),
      body,
      token
    );
  },

  /**
   * PUT /admin/lessons/{lessonId}/weeks — replace-all weeks for a lesson.
   * Confirmed live 204.
   */
  putLessonWeeks(
    lessonId: string,
    body: NestPutLessonWeeksDto,
    token?: string
  ) {
    return apiClient.putMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonWeeks(lessonId),
      body,
      token
    );
  },

  /** POST /admin/weeks — create one week. Confirmed live 204. */
  createWeek(body: NestCreateWeekDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.weeks, body, token);
  },

  /** PATCH /admin/weeks/{id} — update one week. Confirmed live 204. */
  updateWeek(id: string, body: NestUpdateWeekDto, token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.weekById(id),
      body,
      token
    );
  },

  createAcademicSettings(body: NestCreateAcademicSettingsDto, token?: string) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.academicSettings,
      body,
      token
    );
  },
  /** GET /admin/settings — always the latest inserted row. */
  getAcademicSettings(token?: string) {
    return apiClient.getJson<NestAcademicSettings>(
      NEST_ADMIN_PATHS.academicSettings,
      token
    );
  },
};

const NEST_PAGED_CATALOG_PAGE_SIZE = 200;
// Guards a runaway loop if `hasNextPage` never settles to false.
const NEST_PAGED_CATALOG_MAX_PAGES = 50;

async function fetchAllNestPagedCatalog<T>(
  listPage: (
    query: NestAdminPageQuery,
    token?: string
  ) => Promise<NestPagedList<T>>,
  token?: string
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  for (let i = 0; i < NEST_PAGED_CATALOG_MAX_PAGES; i += 1) {
    const { data, hasNextPage } = await listPage(
      { page, limit: NEST_PAGED_CATALOG_PAGE_SIZE },
      token
    );
    all.push(...data);
    if (!hasNextPage) break;
    page += 1;
  }
  return all;
}

/**
 * Full unfiltered province list, for typeaheads/dropdowns that need every
 * province at once. GET /admin/province/all is built for exactly this (no
 * paging envelope, no `hasNextPage` to page through) but has only ever been
 * exercised live with a `title` filter, so this tries it first and falls
 * back to paging GET /admin/provinces if the bulk endpoint errors or turns
 * out not to return the full set. Shared by org-structure reads and the
 * organization-options typeahead so this fallback lives in exactly one
 * place instead of two near-identical copies.
 */
export async function fetchAllNestProvinces(
  token?: string
): Promise<NestProvinceLite[]> {
  try {
    return await adminCatalogApi.getAllProvinces(undefined, token);
  } catch {
    return fetchAllNestPagedCatalog(adminCatalogApi.listProvinces, token);
  }
}

/**
 * Full city catalog. GET /admin/cities is paginated (`hasNextPage`) with
 * no bulk sibling of `/admin/province/all`, so parent-delete checks must
 * walk pages — using only `data` from page 1 would under-block provinces.
 */
export async function fetchAllNestCities(token?: string): Promise<NestCity[]> {
  return fetchAllNestPagedCatalog(adminCatalogApi.listCities, token);
}

export async function fetchAllNestEducations(
  query: Omit<NestEducationListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestEducationalDistrict[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      adminCatalogApi.listEducations({ ...query, ...pageQuery }, pageToken),
    token
  );
}

export async function fetchAllNestSchools(
  query: Omit<NestSchoolListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestSchool[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      adminCatalogApi.listSchools({ ...query, ...pageQuery }, pageToken),
    token
  );
}

export async function fetchAllNestUniversities(
  query: Omit<NestUniversityListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestUniversity[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      adminCatalogApi.listUniversities({ ...query, ...pageQuery }, pageToken),
    token
  );
}
