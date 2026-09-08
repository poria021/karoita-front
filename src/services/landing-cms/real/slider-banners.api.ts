import { apiClient } from '@/services/api-client';
import { parseNestPagedList } from '@/types/nest-admin';
import type { NestFileType } from '@/types/nest-users';

const BASE = 'admin/slider-banners';

export type NestSliderBannerDto = {
  id: string;
  title: string;
  link: string;
  picture: NestFileType;
  createdAt: string;
  updatedAt: string;
};

type CreateSliderBannerBody = {
  picture: { id: string };
  title: string;
  link: string;
};

export const sliderBannersApi = {
  /** GET /admin/slider-banners — لایو گاهی به‌جای `{ data, hasNextPage }` آرایهٔ خام می‌دهد. */
  async listAll(): Promise<NestSliderBannerDto[]> {
    const all: NestSliderBannerDto[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      const raw = await apiClient.getJson<unknown>(`${BASE}?${params}`);
      const { data, hasNextPage } = parseNestPagedList<NestSliderBannerDto>(raw);
      all.push(...data);
      if (!hasNextPage) break;
      page++;
    }
    return all;
  },

  async create(body: CreateSliderBannerBody): Promise<NestSliderBannerDto> {
    return apiClient.postJson<NestSliderBannerDto>(BASE, body);
  },

  async remove(id: string): Promise<void> {
    await apiClient.deleteMaybeJson<null>(`${BASE}/${id}`);
  },
};
