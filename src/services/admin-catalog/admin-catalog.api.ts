import { apiClient } from '@/services/api-client';
import {
  toNestTitleFilterSearchParams,
  toSearchParams,
} from '@/services/nest-search-params';
import { parseNestMaybePagedList, parseNestPagedList } from '@/types/nest-admin';
import type {
  NestAdminPageQuery,
  NestCity,
  NestCreateAcademicSettingsDto,
  NestCreateCityDto,
  NestCreateDegreeDto,
  NestDegreeListQuery,
  NestCreateEducationalDistrictDto,
  NestCreateProvinceDto,
  NestCreateSchoolDto,
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
  NestPatchLessonStatusDto,
  NestProfessorCapacity,
  NestProfessorCapacityWriteDto,
  NestProfessorCapacitiesQuery,
  NestPutLessonWeeksDto,
  NestSemesterAllStructure,
  NestSemesterWithLessons,
  NestUniversity,
  NestUniversityListQuery,
  NestUpdateCityDto,
  NestUpdateDegreeDto,
  NestUpdateEducationalDistrictDto,
  NestUpdateLessonItemDto,
  NestUpdateProvinceDto,
  NestUpdateSchoolDto,
  NestUpdateSemesterDto,
  NestUpdateUniversityDto,
  NestUpdateWeekDto,
} from '@/types/nest-admin';

/**
 * مرتب‌سازی الفبایی — فقط `/admin/provinces` و `/admin/cities` این پارامتر را
 * در OpenAPI لایو تعریف کرده‌اند (چک‌شده روی `/docs-json`). endpointهای دیگر
 * (educations, schools, degreeee, universites) اصلاً `sort` ندارند؛ ارسال آن
 * می‌تواند رد شود یا نادیده گرفته شود — عمداً فقط همین دو مسیر را می‌فرستیم.
 */
const TITLE_ASC_SORT = '[{"orderBy":"title","order":"ASC"}]';

/**
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`).
 * املای `universites` و `degreeee` و DELETE مدرسه بدون `/` با OpenAPI لایو یکی است.
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
  /** DELETE لایو بدون `/` قبل از id: `admin/schools{id}` نه `admin/schools/{id}`. */
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
  lessonStatusById: (id: string) => `admin/lessons/${id}/status`,
  /** PATCH آرایه — ظرفیت/روز/وضعیت چند درس. */
  lessonsStatus: 'admin/lessons/status',
  lessonWeeks: (lessonId: string) => `admin/lessons/${lessonId}/weeks`,
  weeks: 'admin/weeks',
  weekById: (id: string) => `admin/weeks/${id}`,
  weeksByLesson: (lessonId: string) => `admin/weeks/lesson/${lessonId}`,
  academicSettings: 'admin/settings',
  professorCapacities: 'admin/professor-capacities',
} as const;

export const adminCatalogApi = {
  createProvince(body: NestCreateProvinceDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.provinces, body, token);
  },
  /** GET /admin/provinces — `{ data, hasNextPage }` بدون total؛ `filters` باید `{"title":"..."}` باشد. */
  listProvinces(query: NestAdminPageQuery = {}, token?: string) {
    return apiClient.getJson<NestPagedList<NestProvince>>(
      NEST_ADMIN_PATHS.provinces,
      token,
      { searchParams: toNestTitleFilterSearchParams({ ...query, sort: TITLE_ASC_SORT }) }
    );
  },
  /** GET /admin/province/all?title= — آرایهٔ خام، بدون پاکت paging و بدون timestamp روی ردیف. */
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
  /** GET /admin/cities — همان شکل generated-controller استان‌ها؛ `filters` JSON آبجکت-رشته. */
  listCities(query: NestAdminPageQuery = {}, token?: string) {
    return apiClient.getJson<NestPagedList<NestCity>>(NEST_ADMIN_PATHS.cities, token, {
      searchParams: toNestTitleFilterSearchParams({ ...query, sort: TITLE_ASC_SORT }),
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
  /** GET /admin/provinces/{id}/cities?title= — آرایهٔ خام. */
  listCitiesByProvince(
    provinceId: string,
    query: { title?: string } = {},
    token?: string
  ) {
    return apiClient.getJson<NestCity[]>(
      NEST_ADMIN_PATHS.provinceCities(provinceId),
      token,
      { searchParams: toSearchParams({ title: query.title }) }
    );
  },

  createEducation(body: NestCreateEducationalDistrictDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.educations, body, token);
  },
  /**
   * GET /admin/educations — `{ data, hasNextPage }` + page/limit/provinceId/cityId/title.
   * بدون پارامتر `sort` در OpenAPI؛ ارسالش نمی‌کنیم.
   */
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
  /** PUT /admin/educations/{id} — پاسخ ممکن است بدون بدنه باشد؛ `putJson` روی JSON خالی می‌ترکد. */
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
  /**
   * GET /admin/schools — آرایهٔ خام با `userCount` و `education` پرشده.
   * اگر page/limit را نادیده بگیرد و کل لیست را بدهد، سمت کلاینت صفحه می‌شود.
   */
  async listSchoolsCatalog(query: NestSchoolListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.schools,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestMaybePagedList<NestSchool>(raw, query.page, query.limit);
  },
  /** GET /admin/schools/all — `{ data, hasNextPage }` + فیلتر والد؛ بدون `sort` در OpenAPI. */
  async listSchools(query: NestSchoolListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.schoolsAll,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestSchool>(raw);
  },
  /** PUT /admin/schools/{id} — پاسخ ممکن است بدون بدنه باشد؛ مثل educations از putMaybeJson. */
  updateSchool(id: string, body: NestUpdateSchoolDto, token?: string) {
    return apiClient.putMaybeJson<unknown>(NEST_ADMIN_PATHS.schoolById(id), body, token);
  },
  /** DELETE /admin/schools{id} — بدون `/` قبل از id؛ ببین `schoolDeleteById`. */
  deleteSchool(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.schoolDeleteById(id),
      token
    );
  },

  /** POST /admin/degree — `{ roleId, title }`؛ پاسخ ممکن است بدون بدنه باشد. */
  createDegree(body: NestCreateDegreeDto, token?: string) {
    return apiClient.postMaybeJson<unknown>(NEST_ADMIN_PATHS.degree, body, token);
  },
  /**
   * GET /admin/degreeee — `{ data, hasNextPage }`؛ هر ردیف `role: { id, title }`.
   * بدون پارامتر `sort` در OpenAPI؛ ارسالش نمی‌کنیم.
   */
  async listDegrees(query: NestDegreeListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.degreesWithRole,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestDegree>(raw);
  },
  /** PUT /admin/degree/{id} — بدنهٔ لایو سند خام Mongoose است؛ دور می‌اندازیم. */
  updateDegree(id: string, body: NestUpdateDegreeDto, token?: string) {
    return apiClient.putMaybeJson<unknown>(NEST_ADMIN_PATHS.degreeById(id), body, token);
  },
  /** DELETE /admin/degree/{id} — `{ message: "Deleted successfully" }`. */
  deleteDegree(id: string, token?: string) {
    return apiClient.deleteMaybeJson<unknown>(
      NEST_ADMIN_PATHS.degreeById(id),
      token
    );
  },

  listRoles(token?: string) {
    return apiClient.getJson<NestRole[]>(NEST_ADMIN_PATHS.roles, token);
  },
  /** GET /admin/roles/{roleId}/degrees — رشته‌های همان نقش. */
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
  /** GET /admin/universites — `{ data, hasNextPage }` (املای لایو)؛ بدون `sort` در OpenAPI. */
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

  /** POST /admin/semester — لایو ۲۰۴ بدون بدنه. */
  /** POST /admin/semester — لایو ۲۰۴؛ بدنه کامل با `structure: semester|podmani`. */
  createSemester(body: NestCreateSemesterDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.semesters, body, token);
  },
  /** GET /admin/semester — آرایهٔ خام با گیت روی هر ردیف، بدون پاکت paging. */
  listSemesters(token?: string) {
    return apiClient.getJson<unknown>(NEST_ADMIN_PATHS.semesters, token);
  },
  /** GET /admin/semester/{id}. */
  getSemester(id: string, token?: string) {
    return apiClient.getJson<unknown>(NEST_ADMIN_PATHS.semesterById(id), token);
  },
  /**
   * PATCH /admin/semester/{id} — بدنهٔ کامل شامل گیت.
   * لایو ممکن است ۲۰۴ یا سند خام mongoose بدهد؛ بدنه را مصرف نکن.
   */
  updateSemester(id: string, body: NestUpdateSemesterDto, token?: string) {
    return apiClient.patchMaybeJson<unknown>(
      NEST_ADMIN_PATHS.semesterById(id),
      body,
      token
    );
  },
  /** DELETE /admin/semester/{id} — لایو ۲۰۰ با بدنهٔ خالی. */
  deleteSemester(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.semesterById(id),
      token
    );
  },

  /** GET /admin/semesters_all?structure=semester|podmani — آرایهٔ خام با درس/هفتهٔ تو در تو. */
  listSemestersAll(structure: NestSemesterAllStructure, token?: string) {
    return apiClient.getJson<NestSemesterWithLessons[]>(
      NEST_ADMIN_PATHS.semestersAll,
      token,
      { searchParams: toSearchParams({ structure }) }
    );
  },

  /** GET /admin/weeks/lesson/{lessonId} — آرایهٔ `{ id, lessonId, priority, status }`. */
  listWeeksByLesson(lessonId: string, token?: string) {
    return apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.weeksByLesson(lessonId),
      token
    );
  },

  /** PATCH /admin/lessons/{id}/status — فلگ ارائه/ظرفیت/روز یک درس؛ لایو ۲۰۴. */
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

  /** PATCH /admin/lessons/status — آرایهٔ به‌روزرسانی چند درس؛ لایو ۲۰۴. */
  patchLessonsStatus(body: NestUpdateLessonItemDto[], token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonsStatus,
      body,
      token
    );
  },

  /** PUT /admin/lessons/{lessonId}/weeks — جایگزینی همهٔ هفته‌ها؛ لایو ۲۰۴. */
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

  /** POST /admin/weeks — یک هفته؛ لایو ۲۰۴. */
  createWeek(body: NestCreateWeekDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.weeks, body, token);
  },

  /** PATCH /admin/weeks/{id} — لایو ۲۰۴. */
  updateWeek(id: string, body: NestUpdateWeekDto, token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.weekById(id),
      body,
      token
    );
  },

  /** DELETE /admin/weeks/{id} — حذف هفته از درس. */
  deleteWeek(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_ADMIN_PATHS.weekById(id), token);
  },

  /** POST /admin/settings — ردیف جدید؛ لایو ۲۰۴. GET بعدی آخرین را می‌دهد. */
  createAcademicSettings(body: NestCreateAcademicSettingsDto, token?: string) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.academicSettings,
      body,
      token
    );
  },
  /** GET /admin/settings — آخرین ردیف درج‌شده `{ id, systemPassingScore, generalProfessorCapacity }`. */
  getAcademicSettings(token?: string) {
    return apiClient.getJson<unknown>(NEST_ADMIN_PATHS.academicSettings, token);
  },

  /** GET /admin/professor-capacities?lessonId=&semesterId= — آرایه؛ خالی یعنی هنوز ردیفی نیست. */
  listProfessorCapacities(query: NestProfessorCapacitiesQuery = {}, token?: string) {
    return apiClient.getJson<NestProfessorCapacity[]>(
      NEST_ADMIN_PATHS.professorCapacities,
      token,
      { searchParams: toSearchParams(query) }
    );
  },

  /** POST /admin/professor-capacities — آرایه؛ لایو ۲۰۴. */
  createProfessorCapacities(
    body: NestProfessorCapacityWriteDto[],
    token?: string
  ) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.professorCapacities,
      body,
      token
    );
  },

  /** PUT /admin/professor-capacities — تطبیق با professorId + lessonId؛ لایو ۲۰۴. */
  updateProfessorCapacities(
    body: NestProfessorCapacityWriteDto[],
    token?: string
  ) {
    return apiClient.putMaybeJson<null>(
      NEST_ADMIN_PATHS.professorCapacities,
      body,
      token
    );
  },
};

const NEST_PAGED_CATALOG_PAGE_SIZE = 200;
// اگر `hasNextPage` هیچ‌وقت false نشود حلقه قطع شود.
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
 * همهٔ استان‌ها برای typeahead: اول GET /admin/province/all (بدون پاکت)، اگر خطا داد صفحات GET /admin/provinces.
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
 * همهٔ شهرها: GET /admin/cities صفحه‌بندی دارد و bulk مثل `/admin/province/all` ندارد — صفحهٔ ۱ برای قفل حذف کافی نیست.
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

export async function fetchAllNestDegrees(
  query: Omit<NestDegreeListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestDegree[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      adminCatalogApi.listDegrees({ ...query, ...pageQuery }, pageToken),
    token
  );
}
