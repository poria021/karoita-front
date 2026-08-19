import { apiClient } from '@/services/api-client';
import type { NestFileResponseDto, NestFileUploadDto } from '@/types/nest-users';

/** Swagger: POST `/api/v1/files/upload` */
export const NEST_FILES_PATH = 'v1/files/upload';

export const filesApi = {
  upload(body: NestFileUploadDto, token?: string) {
    return apiClient.postJson<NestFileResponseDto>(NEST_FILES_PATH, body, token);
  },
};
