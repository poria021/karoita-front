/**
 * HTTP حساب ادمین Nest — GET/POST `/api/v1/admin/admins` و GET/PUT `/{id}`.
 * مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`).
 */
import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import {
  mapAdminsPage,
  mapNestAdminAccount,
} from '@/services/admin-user-creation/real/admins.mappers';
import type {
  StaffAdminAccount,
  StaffAdminsPage,
} from '@/types/admin-user-creation';
import type {
  NestAdminDto,
  NestAdminsListQuery,
  NestCreateAdminDto,
  NestUpdateAdminDto,
} from '@/types/nest-admins';

export const NEST_ADMINS_PATHS = {
  list: 'v1/admin/admins',
  byId: (id: string) => `v1/admin/admins/${id}`,
} as const;

export const adminsApi = {
  /** POST /api/v1/admin/admins — ۲۰۱. */
  create(body: NestCreateAdminDto, token?: string) {
    return apiClient.postJson<NestAdminDto>(NEST_ADMINS_PATHS.list, body, token);
  },

  /** GET /api/v1/admin/admins?page=&limit= */
  async list(
    query: NestAdminsListQuery = {},
    token?: string
  ): Promise<StaffAdminsPage> {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMINS_PATHS.list,
      token,
      { searchParams: toSearchParams(query) }
    );
    return mapAdminsPage(raw);
  },

  /** GET /api/v1/admin/admins/{id} */
  async getById(id: string, token?: string): Promise<StaffAdminAccount> {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMINS_PATHS.byId(id),
      token
    );
    const mapped = isRecord(raw) ? mapNestAdminAccount(raw) : null;
    if (!mapped) {
      throw new Error('پاسخ حساب ادمین نامعتبر است.');
    }
    return mapped;
  },

  /** PUT /api/v1/admin/admins/{id} — بدنهٔ ۲۰۰ ردیف است؛ پاسخ خالی با GET همان id جبران می‌شود. */
  async update(
    id: string,
    body: NestUpdateAdminDto,
    token?: string
  ): Promise<StaffAdminAccount> {
    const raw = await apiClient.putMaybeJson<unknown>(
      NEST_ADMINS_PATHS.byId(id),
      body,
      token
    );
    if (raw && isRecord(raw)) {
      const mapped = mapNestAdminAccount(raw);
      if (mapped) return mapped;
    }
    return adminsApi.getById(id, token);
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
