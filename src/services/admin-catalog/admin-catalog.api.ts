import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  NestAdminPageQuery,
  NestCity,
  NestCreateCityDto,
  NestCreateDegreeDto,
  NestCreateEducationalDistrictDto,
  NestCreateProvinceDto,
  NestCreateSchoolDto,
  NestCreateUniversityDto,
  NestDegree,
  NestDegreeByRole,
  NestEducationalDistrict,
  NestEducationListQuery,
  NestPagedList,
  NestProvince,
  NestRole,
  NestSchool,
  NestSchoolListQuery,
  NestUniversity,
  NestUpdateCityDto,
  NestUpdateDegreeDto,
  NestUpdateEducationalDistrictDto,
  NestUpdateProvinceDto,
  NestUpdateSchoolDto,
  NestUpdateUniversityDto,
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
  schoolById: (id: string) => `admin/schools/${id}`,
  degree: 'admin/degree',
  degreeById: (id: string) => `admin/degree/${id}`,
  degreesWithRole: 'admin/degreeee',
  roles: 'admin/roles',
  roleDegrees: (roleId: string) => `admin/roles/${roleId}/degrees`,
  universities: 'admin/universites',
  universityById: (id: string) => `admin/universites/${id}`,
} as const;

export const adminCatalogApi = {
  createProvince(body: NestCreateProvinceDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.provinces, body, token);
  },
  /** GET /admin/provinces — paged envelope: { data, hasNextPage }. */
  listProvinces(query: NestAdminPageQuery = {}, token?: string) {
    return apiClient.getJson<NestPagedList<NestProvince>>(
      NEST_ADMIN_PATHS.provinces,
      token,
      { searchParams: toSearchParams(query) }
    );
  },
  getAllProvinces(token?: string) {
    return apiClient.getJson<NestProvince[]>(NEST_ADMIN_PATHS.provincesAll, token);
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
  /** GET /admin/cities — paged envelope: { data, hasNextPage }. */
  listCities(query: NestAdminPageQuery = {}, token?: string) {
    return apiClient.getJson<NestPagedList<NestCity>>(
      NEST_ADMIN_PATHS.cities,
      token,
      { searchParams: toSearchParams(query) }
    );
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
  /** GET /admin/educations — bare array, no paging envelope. */
  listEducations(query: NestEducationListQuery = {}, token?: string) {
    return apiClient.getJson<NestEducationalDistrict[]>(
      NEST_ADMIN_PATHS.educations,
      token,
      { searchParams: toSearchParams(query) }
    );
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
  updateEducation(
    id: string,
    body: NestUpdateEducationalDistrictDto,
    token?: string
  ) {
    return apiClient.putJson<unknown>(
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
  /** GET /admin/schools — bare array, no paging envelope. */
  listSchools(query: NestSchoolListQuery = {}, token?: string) {
    return apiClient.getJson<NestSchool[]>(NEST_ADMIN_PATHS.schools, token, {
      searchParams: toSearchParams(query),
    });
  },
  updateSchool(id: string, body: NestUpdateSchoolDto, token?: string) {
    return apiClient.putJson<unknown>(NEST_ADMIN_PATHS.schoolById(id), body, token);
  },
  deleteSchool(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_ADMIN_PATHS.schoolById(id), token);
  },

  createDegree(body: NestCreateDegreeDto, token?: string) {
    return apiClient.postJson<unknown>(NEST_ADMIN_PATHS.degree, body, token);
  },
  /** GET /admin/degreeee ("all degrees with role") — bare array. */
  listDegrees(title?: string, token?: string) {
    return apiClient.getJson<NestDegree[]>(NEST_ADMIN_PATHS.degreesWithRole, token, {
      searchParams: toSearchParams({ title }),
    });
  },
  updateDegree(id: string, body: NestUpdateDegreeDto, token?: string) {
    return apiClient.putJson<unknown>(NEST_ADMIN_PATHS.degreeById(id), body, token);
  },
  deleteDegree(id: string, token?: string) {
    return apiClient.deleteMaybeJson<unknown>(
      NEST_ADMIN_PATHS.degreeById(id),
      token
    );
  },

  /** GET /admin/roles — bare array, only `{ id }` confirmed live. */
  listRoles(token?: string) {
    return apiClient.getJson<NestRole[]>(NEST_ADMIN_PATHS.roles, token);
  },
  /** GET /admin/roles/{roleId}/degrees — bare array, already role-scoped. */
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
  /** GET /admin/universites — bare array, title-only filter. */
  listUniversities(title?: string, token?: string) {
    return apiClient.getJson<NestUniversity[]>(NEST_ADMIN_PATHS.universities, token, {
      searchParams: toSearchParams({ title }),
    });
  },
  updateUniversity(id: string, body: NestUpdateUniversityDto, token?: string) {
    return apiClient.putJson<unknown>(
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
};
