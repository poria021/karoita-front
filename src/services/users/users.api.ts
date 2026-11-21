import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  NestDashboardCountsDto,
  NestDocumentsStatusDto,
  NestInfinityPaginationUserResponse,
  NestUpdateUserDto,
  NestUserDto,
  NestUsersListQuery,
} from '@/types/nest-users';

/**
 * مسیر نسبت به `NEXT_PUBLIC_API_URL`. Swagger: GET/PATCH/DELETE `/api/v1/users`.
 */
export const NEST_USERS_PATHS = {
  list: 'v1/users',
  dashboardCounts: 'v1/users/dashboard/counts',
  documentsStatus: 'v1/users/documents/status',
  byId: (id: string) => `v1/users/${id}`,
} as const;

export const usersApi = {
  /** GET /api/v1/users */
  list(query: NestUsersListQuery = {}, token?: string) {
    return apiClient.getJson<NestInfinityPaginationUserResponse>(
      NEST_USERS_PATHS.list,
      token,
      { searchParams: toSearchParams(query) }
    );
  },

  /** GET /api/v1/users/dashboard/counts — فقط ادمین/سوپرادمین (میز کار). */
  dashboardCounts(token?: string) {
    return apiClient.getJson<NestDashboardCountsDto>(
      NEST_USERS_PATHS.dashboardCounts,
      token
    );
  },

  /** GET /api/v1/users/documents/status — { pending, confirmed, rejected, total }. */
  documentsStatus(token?: string) {
    return apiClient.getJson<NestDocumentsStatusDto>(
      NEST_USERS_PATHS.documentsStatus,
      token
    );
  },

  /** GET /api/v1/users/{id} */
  getById(id: string, token?: string) {
    return apiClient.getJson<NestUserDto>(NEST_USERS_PATHS.byId(id), token);
  },

  /** PATCH /api/v1/users/{id} */
  update(id: string, body: NestUpdateUserDto, token?: string) {
    return apiClient.patchJson<NestUserDto>(
      NEST_USERS_PATHS.byId(id),
      body,
      token
    );
  },

  /** DELETE /api/v1/users/{id} — لایو ۲۰۴. */
  remove(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_USERS_PATHS.byId(id), token);
  },
};
