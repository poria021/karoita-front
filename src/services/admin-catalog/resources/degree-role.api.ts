import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestCreateDegreeDto,
  NestDegree,
  NestDegreeByRole,
  NestDegreeListQuery,
  NestRole,
  NestUpdateDegreeDto,
} from '@/types/nest-admin';

import { NEST_ADMIN_PATHS } from '../paths';

export const degreeRoleApi = {
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
};
