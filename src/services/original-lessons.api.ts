import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestBulkCreateOriginalLessonDto,
  NestOriginalLesson,
  NestOriginalLessonListQuery,
  NestUpdateOriginalLessonDto,
} from '@/types/nest-original-lessons';

import { NEST_ADMIN_PATHS } from './admin-catalog/paths';

export const originalLessonsApi = {
  /** POST /original-lessons → 201 + آرایهٔ درس‌های ساخته‌شده. */
  createBulk(body: NestBulkCreateOriginalLessonDto, token?: string) {
    return apiClient.postJson<NestOriginalLesson[]>(
      NEST_ADMIN_PATHS.originalLessons,
      body,
      token
    );
  },

  /** GET /original-lessons → `{ data, hasNextPage }` با page/limit/mainTitle. */
  async list(query: NestOriginalLessonListQuery = {}, token?: string) {
    const raw = await apiClient.getJson<unknown>(NEST_ADMIN_PATHS.originalLessons, token, {
      searchParams: toSearchParams(query),
    });
    return parseNestPagedList<NestOriginalLesson>(raw);
  },

  /** GET /original-lessons/{id} */
  getById(id: string, token?: string) {
    return apiClient.getJson<NestOriginalLesson>(NEST_ADMIN_PATHS.originalLessonById(id), token);
  },

  /** PATCH /original-lessons/{id} → درس به‌روزشده. */
  update(id: string, body: NestUpdateOriginalLessonDto, token?: string) {
    return apiClient.patchJson<NestOriginalLesson>(
      NEST_ADMIN_PATHS.originalLessonById(id),
      body,
      token
    );
  },

  /** DELETE /original-lessons/{id} → 200 بدون بدنه. */
  remove(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_ADMIN_PATHS.originalLessonById(id), token);
  },
};
