import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import { parseNestMaybePagedList, parseNestPagedList } from '@/types/nest-admin';
import type {
  NestCreateEducationalDistrictDto,
  NestCreateSchoolDto,
  NestEducationalDistrict,
  NestEducationListQuery,
  NestSchool,
  NestSchoolListQuery,
  NestUpdateEducationalDistrictDto,
  NestUpdateSchoolDto,
} from '@/types/nest-admin';

import { NEST_ADMIN_PATHS } from '../paths';

export const educationSchoolApi = {
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
};
