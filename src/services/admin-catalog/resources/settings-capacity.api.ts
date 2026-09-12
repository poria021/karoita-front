import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  NestCreateAcademicSettingsDto,
  NestProfessorCapacitiesQuery,
  NestProfessorCapacity,
  NestProfessorCapacityWriteDto,
} from '@/types/nest-admin';

import { NEST_ADMIN_PATHS } from '../paths';

export const settingsCapacityApi = {
  /** POST /admin/settings — ردیف جدید؛ لایو ۲۰۴. GET بعدی آخرین را می‌دهد. */
  createAcademicSettings(body: NestCreateAcademicSettingsDto, token?: string) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.academicSettings,
      body,
      token
    );
  },
  /** GET /admin/settings — آخرین ردیف درج‌شده `{ id, systemPassingScore, generalProfessorCapacity }`. */
  getAcademicSettings(token?: string) {
    return apiClient.getJson<unknown>(NEST_ADMIN_PATHS.academicSettings, token);
  },

  /** GET /admin/professor-capacities?lessonId=&semesterId= — آرایه؛ خالی یعنی هنوز ردیفی نیست. */
  listProfessorCapacities(query: NestProfessorCapacitiesQuery = {}, token?: string) {
    return apiClient.getJson<NestProfessorCapacity[]>(
      NEST_ADMIN_PATHS.professorCapacities,
      token,
      { searchParams: toSearchParams(query) }
    );
  },

  /** POST /admin/professor-capacities — آرایه؛ لایو ۲۰۴. */
  createProfessorCapacities(
    body: NestProfessorCapacityWriteDto[],
    token?: string
  ) {
    return apiClient.postMaybeJson<null>(
      NEST_ADMIN_PATHS.professorCapacities,
      body,
      token
    );
  },

  /** PUT /admin/professor-capacities — تطبیق با professorId + lessonId؛ لایو ۲۰۴. */
  updateProfessorCapacities(
    body: NestProfessorCapacityWriteDto[],
    token?: string
  ) {
    return apiClient.putMaybeJson<null>(
      NEST_ADMIN_PATHS.professorCapacities,
      body,
      token
    );
  },
};
