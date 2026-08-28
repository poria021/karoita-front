import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  NestAdminsListQuery,
  NestAdminsListResponse,
  NestAdminDto,
  NestCreateAdminDto,
  NestUpdateAdminDto,
} from '@/types/nest-admins';

/**
 * Relative to NEXT_PUBLIC_API_URL (`.../api`).
 * Source: https://backenddev.darkube.ir/docs — Admin tag.
 * Swagger: `/api/v1/admin/admins`.
 */
export const NEST_ADMINS_PATHS = {
  list: 'v1/admin/admins',
  byId: (id: string) => `v1/admin/admins/${id}`,
} as const;

export const adminsApi = {
  /** POST /api/v1/admin/admins — 201 */
  create(body: NestCreateAdminDto, token?: string) {
    return apiClient.postJson<NestAdminDto>(NEST_ADMINS_PATHS.list, body, token);
  },

  /** GET /api/v1/admin/admins */
  list(query: NestAdminsListQuery = {}, token?: string) {
    return apiClient.getJson<NestAdminsListResponse>(
      NEST_ADMINS_PATHS.list,
      token,
      { searchParams: toSearchParams(query) }
    );
  },

  /** GET /api/v1/admin/admins/{id} */
  getById(id: string, token?: string) {
    return apiClient.getJson<NestAdminDto>(NEST_ADMINS_PATHS.byId(id), token);
  },

  /** PUT /api/v1/admin/admins/{id} */
  update(id: string, body: NestUpdateAdminDto, token?: string) {
    return apiClient.putJson<NestAdminDto>(
      NEST_ADMINS_PATHS.byId(id),
      body,
      token
    );
  },
};
