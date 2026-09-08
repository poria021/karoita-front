import { apiClient } from '@/services/api-client';
import { parseNestPagedList } from '@/types/nest-admin';
import type { NestFileType } from '@/types/nest-users';

const BASE = 'admin/floating-products';

export type NestFloatingProductDto = {
  id: string;
  title: string;
  link: string;
  picture: NestFileType;
  createdAt: string;
  updatedAt: string;
};

type CreateFloatingProductBody = {
  picture: { id: string };
  title: string;
  link: string;
};

export const floatingProductsApi = {
  /** GET /admin/floating-products — لایو گاهی به‌جای `{ data, hasNextPage }` آرایهٔ خام می‌دهد. */
  async listAll(): Promise<NestFloatingProductDto[]> {
    const all: NestFloatingProductDto[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      const raw = await apiClient.getJson<unknown>(`${BASE}?${params}`);
      const { data, hasNextPage } = parseNestPagedList<NestFloatingProductDto>(raw);
      all.push(...data);
      if (!hasNextPage) break;
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
