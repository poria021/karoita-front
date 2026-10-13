import { apiClient } from '@/services/api-client';
import type {
  NestCreateMentorLessonFileDto,
  NestMentorLessonFile,
} from '@/types/nest-mentor-lesson-files';

import { NEST_ADMIN_PATHS } from './admin-catalog/paths';

export const mentorLessonFilesApi = {
  create(body: NestCreateMentorLessonFileDto, token?: string) {
    return apiClient.postJson<NestMentorLessonFile>(
      NEST_ADMIN_PATHS.mentorLessonFiles,
      body,
      token,
    );
  },

    /** GET /v1/mentor-lesson-files → فایل‌های همین منتور. */
  list(token?: string) {
    return apiClient.getJson<NestMentorLessonFile[]>(
      NEST_ADMIN_PATHS.mentorLessonFiles,
      token
    );
  },

    /** DELETE /v1/mentor-lesson-files/{id} → 204 بدون بدنه، فقط منتور. */
  remove(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.mentorLessonFileById(id),
      token,
    );
  },

    /** GET /v1/lessons/{lessonId}/mentor-files → فایل‌های منتورِ این دانشجو، فقط دانشجو. */
  listForStudent(lessonId: string, token?: string) {
    return apiClient.getJson<NestMentorLessonFile[]>(
      NEST_ADMIN_PATHS.lessonMentorFiles(lessonId),
      token,
    );
  },
};
