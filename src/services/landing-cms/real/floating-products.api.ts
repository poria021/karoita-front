import { apiClient } from '@/services/api-client';
import type { NestFileType } from '@/types/nest-users';

const BASE = 'api/admin/floating-products';

export type NestFloatingProductDto = {
  id: string;
  title: string;
  link: string;
  picture: NestFileType;
  createdAt: string;
  updatedAt: string;
};

type NestFloatingProductsListDto = {
  data: NestFloatingProductDto[];
  hasNextPage: boolean;
};

type CreateFloatingProductBody = {
  picture: { id: string };
  title: string;
  link: string;
};

export const floatingProductsApi = {
  async listAll(): Promise<NestFloatingProductDto[]> {
    const all: NestFloatingProductDto[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      const res = await apiClient.getJson<NestFloatingProductsListDto>(
        `${BASE}?${params}`
      );
      all.push(...res.data);
      if (!res.hasNextPage) break;
      page++;
    }
    return all;
  },

  async create(body: CreateFloatingProductBody): Promise<NestFloatingProductDto> {
    return apiClient.postJson<NestFloatingProductDto>(BASE, body);
  },

  async remove(id: string): Promise<void> {
    await apiClient.deleteMaybeJson<null>(`${BASE}/${id}`);
  },
};
