/**
 * HTTP خام Nest برای تبلیغ/اطلاعیه.
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) هستند؛ UI این فایل را مستقیم صدا نزند.
 */
import { apiClient } from '@/services/api-client';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestAdvertisementDto,
  NestAdvertisementFormat,
  NestAdvertisementPlacement,
  NestAdvertisementStatus,
  NestAdvertisementType,
  NestCreateAdvertisementBody,
  NestPublicAdvertisementDto,
  NestToggleAdvertisementBody,
  NestUpdateAdvertisementBody,
} from '@/types/nest-advertisements';

const PUBLIC = 'v1/advertisements';
const ADMIN = 'admin/advertisements';

export type ListVisibleAdsQuery = {
  type: NestAdvertisementType;
  placement: NestAdvertisementPlacement;
};

export type ListAdminAdsQuery = {
  page?: number;
  limit?: number;
  status?: NestAdvertisementStatus;
  placement?: NestAdvertisementPlacement;
  type?: NestAdvertisementType;
  format?: NestAdvertisementFormat;
};

export const advertisementsApi = {
  /** GET /api/v1/advertisements — هر پاسخ یک impression ثبت می‌کند. */
  listVisible(query: ListVisibleAdsQuery): Promise<NestPublicAdvertisementDto[]> {
    const params = new URLSearchParams({
      type: query.type,
      placement: query.placement,
    });
    return apiClient.getJson<NestPublicAdvertisementDto[]>(`${PUBLIC}?${params}`);
  },

  /** POST /api/v1/advertisements/{id}/clicks */
  recordClick(id: string): Promise<{ success: boolean }> {
    return apiClient.postJson<{ success: boolean }>(
      `${PUBLIC}/${encodeURIComponent(id)}/clicks`,
      {}
    );
  },

  /** GET /api/admin/advertisements — همهٔ صفحات تا `hasNextPage` تمام شود. */
  async listManaged(query: ListAdminAdsQuery = {}): Promise<NestAdvertisementDto[]> {
    const all: NestAdvertisementDto[] = [];
    let page = query.page ?? 1;
    const limit = query.limit ?? 100;
    while (true) {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (query.status) params.set('status', query.status);
      if (query.placement) params.set('placement', query.placement);
      if (query.type) params.set('type', query.type);
      if (query.format) params.set('format', query.format);
      const raw = await apiClient.getJson<unknown>(`${ADMIN}?${params}`);
      const { data, hasNextPage } = parseNestPagedList<NestAdvertisementDto>(raw);
      all.push(...data);
      if (!hasNextPage) break;
      page += 1;
    }
    return all;
  },

  create(body: NestCreateAdvertisementBody): Promise<NestAdvertisementDto> {
    return apiClient.postJson<NestAdvertisementDto>(ADMIN, body);
  },

  getOne(id: string): Promise<NestAdvertisementDto> {
    return apiClient.getJson<NestAdvertisementDto>(
      `${ADMIN}/${encodeURIComponent(id)}`
    );
  },

  update(id: string, body: NestUpdateAdvertisementBody): Promise<NestAdvertisementDto> {
    return apiClient.patchJson<NestAdvertisementDto>(
      `${ADMIN}/${encodeURIComponent(id)}`,
      body
    );
  },

  setActive(id: string, body: NestToggleAdvertisementBody): Promise<NestAdvertisementDto> {
    return apiClient.patchJson<NestAdvertisementDto>(
      `${ADMIN}/${encodeURIComponent(id)}/activation`,
      body
    );
  },

  async remove(id: string): Promise<void> {
    await apiClient.deleteMaybeJson<null>(`${ADMIN}/${encodeURIComponent(id)}`);
  },
};
