import { requireNestTransport } from '@/services/require-nest-transport';
import { filesApi } from '@/services/files/files.api';
import type { NestFileResponseDto, NestFileUploadDto } from '@/types/nest-users';

/**
 * Nest Files facade — https://backenddev.darkube.ir/docs#/ Files
 * POST /api/v1/files/upload → presigned S3 URL + FileType.
 */
export const FilesService = {
  async requestUpload(
    body: NestFileUploadDto,
    token?: string
  ): Promise<NestFileResponseDto> {
    requireNestTransport('FilesService.requestUpload');
    return filesApi.upload(body, token);
  },
};
