import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestCreateUniversityDto,
  NestUniversity,
  NestUniversityListQuery,
  NestUpdateUniversityDto,
} from '@/types/nest-admin';

import { NEST_ADMIN_PATHS } from '../paths';

export const universityApi = {
  createUniversity(body: NestCreateUniversityDto, token?: string) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.universities,
      body,
      token
    );
  },
  /** GET /admin/universites — `{ data, hasNextPage }` (املای لایو)؛ بدون `sort` در OpenAPI. */
  async listUniversities(
    query: NestUniversityListQuery = {},
    token?: string
  ) {
    const raw = await apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.universities,
      token,
      { searchParams: toSearchParams(query) }
    );
    return parseNestPagedList<NestUniversity>(raw);
  },
  updateUniversity(id: string, body: NestUpdateUniversityDto, token?: string) {
    return apiClient.putMaybeJson<unknown>(
      NEST_ADMIN_PATHS.universityById(id),
      body,
      token
    );
  },
  deleteUniversity(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.universityById(id),
      token
    );
  },
};
