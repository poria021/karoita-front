import { apiClient } from '@/services/api-client';
import { parseNestPagedList } from '@/types/nest-admin';
import type { NestFileType } from '@/types/nest-users';

const BASE = 'admin/social-networks';

export type NestSocialNetworkDto = {
  id: string;
  name: string;
  link: string;
  picture: NestFileType | null;
  createdAt: string;
  updatedAt: string;
};

type CreateSocialNetworkBody = {
  picture?: { id: string };
  name: string;
  link: string;
};

export const socialNetworksApi = {
  /** GET /admin/social-networks — لایو گاهی به‌جای `{ data, hasNextPage }` آرایهٔ خام می‌دهد. */
  async listAll(): Promise<NestSocialNetworkDto[]> {
    const all: NestSocialNetworkDto[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      const raw = await apiClient.getJson<unknown>(`${BASE}?${params}`);
      const { data, hasNextPage } = parseNestPagedList<NestSocialNetworkDto>(raw);
      all.push(...data);
      if (!hasNextPage) break;
      page++;
    }
    return all;
  },

  async create(body: CreateSocialNetworkBody): Promise<NestSocialNetworkDto> {
    return apiClient.postJson<NestSocialNetworkDto>(BASE, body);
  },

  async remove(id: string): Promise<void> {
    await apiClient.deleteMaybeJson<null>(`${BASE}/${id}`);
  },
};
