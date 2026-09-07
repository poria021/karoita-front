import { apiClient } from '@/services/api-client';
import type { NestFileType } from '@/types/nest-users';

const BASE = 'api/admin/slider-banners';

export type NestSliderBannerDto = {
  id: string;
  title: string;
  link: string;
  picture: NestFileType;
  createdAt: string;
  updatedAt: string;
};

type NestSliderBannersListDto = {
  data: NestSliderBannerDto[];
  hasNextPage: boolean;
};

type CreateSliderBannerBody = {
  picture: { id: string };
  title: string;
  link: string;
};

export const sliderBannersApi = {
  async listAll(): Promise<NestSliderBannerDto[]> {
    const all: NestSliderBannerDto[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      const res = await apiClient.getJson<NestSliderBannersListDto>(
        `${BASE}?${params}`
      );
      all.push(...res.data);
      if (!res.hasNextPage) break;
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
