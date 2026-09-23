import { apiClient } from '@/services/api-client';
import {
  toNestTitleFilterSearchParams,
  toSearchParams,
} from '@/services/nest-search-params';
import type {
  NestAdminPageQuery,
  NestCity,
  NestCreateCityDto,
  NestCreateProvinceDto,
  NestPagedList,
  NestProvince,
  NestProvinceLite,
  NestUpdateCityDto,
  NestUpdateProvinceDto,
} from '@/types/nest-admin';

import { NEST_ADMIN_PATHS, TITLE_ASC_SORT } from '../paths';

export const provinceCityApi = {
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
};
