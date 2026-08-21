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

export type NestCity = {
  id: string;
  title: string;
  province_id: string;
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
  cityId: string;
  title: string;
};

export type NestUpdateEducationalDistrictDto = {
  provinceId?: string;
  cityId?: string;
  title?: string;
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

export type NestCreateDegreeDto = {
  roleId: string;
  title: string;
};

export type NestUpdateDegreeDto = {
  roleId?: string;
  title?: string;
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
