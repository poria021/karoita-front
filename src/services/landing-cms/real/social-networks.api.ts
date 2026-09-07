import { apiClient } from '@/services/api-client';
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

type NestSocialNetworksListDto = {
  data: NestSocialNetworkDto[];
  hasNextPage: boolean;
};

type CreateSocialNetworkBody = {
  picture?: { id: string };
  name: string;
  link: string;
};

export const socialNetworksApi = {
  async listAll(): Promise<NestSocialNetworkDto[]> {
    const all: NestSocialNetworkDto[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      const res = await apiClient.getJson<NestSocialNetworksListDto>(
        `${BASE}?${params}`
      );
      all.push(...res.data);
      if (!res.hasNextPage) break;
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
