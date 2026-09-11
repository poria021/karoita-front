/**
 * HTTP حساب سازمانی Nest — POST/GET/PATCH/DELETE `/api/v1/admin/account-users`.
 * مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`).
 */
import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestAccountUserDto,
  NestAccountUsersListQuery,
  NestCreateAccountUserDto,
  NestUpdateAccountUserDto,
} from '@/types/nest-account-users';

export const NEST_ACCOUNT_USERS_PATHS = {
  list: 'v1/admin/account-users',
  roles: 'v1/admin/account-users/roles',
  byId: (id: string) => `v1/admin/account-users/${id}`,
} as const;

export const accountUsersApi = {
  /** POST /api/v1/admin/account-users — ۲۰۱. */
  create(body: NestCreateAccountUserDto, token?: string) {
    return apiClient.postJson<NestAccountUserDto>(
      NEST_ACCOUNT_USERS_PATHS.list,
      body,
      token
    );
  },

  /** GET /api/v1/admin/account-users?page=&limit=&role= */
  async list(query: NestAccountUsersListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ACCOUNT_USERS_PATHS.list,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestAccountUserDto>(raw);
  },

  /** GET /api/v1/admin/account-users/roles — شناسهٔ نقش‌های سازمانی برای فیلد role در create/update. */
  listRoles(token?: string) {
    return apiClient.getJson<unknown>(NEST_ACCOUNT_USERS_PATHS.roles, token);
  },

  /**
   * GET /api/v1/admin/account-users/{id} — روی id نامعتبر/حذف‌شده لایو ۲۰۰ با
   * بدنهٔ `null` می‌دهد (نه ۴۰۴). caller باید قبل از مصرف null بودن را چک کند.
   */
  getById(id: string, token?: string) {
    return apiClient.getJson<NestAccountUserDto>(
      NEST_ACCOUNT_USERS_PATHS.byId(id),
      token
    );
  },

  /** PATCH /api/v1/admin/account-users/{id} */
  update(id: string, body: NestUpdateAccountUserDto, token?: string) {
    return apiClient.patchJson<NestAccountUserDto>(
      NEST_ACCOUNT_USERS_PATHS.byId(id),
      body,
      token
    );
  },

  /** DELETE /api/v1/admin/account-users/{id} — لایو ۲۰۴. */
  remove(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ACCOUNT_USERS_PATHS.byId(id),
      token
    );
  },
};
