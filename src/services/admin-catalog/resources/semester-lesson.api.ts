import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  NestCreateSemesterDto,
  NestCreateWeekDto,
  NestPatchLessonStatusDto,
  NestPutLessonWeeksDto,
  NestSemesterAllStructure,
  NestSemesterWithLessons,
  NestUpdateLessonItemDto,
  NestUpdateSemesterDto,
  NestUpdateWeekDto,
} from '@/types/nest-admin';

import { NEST_ADMIN_PATHS } from '../paths';

export const semesterLessonApi = {
  /** POST /admin/semester — لایو ۲۰۴؛ بدنه کامل با `structure: semester|podmani`. */
  createSemester(body: NestCreateSemesterDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.semesters, body, token);
  },
  /** GET /admin/semester — آرایهٔ خام با گیت روی هر ردیف، بدون پاکت paging. */
  listSemesters(token?: string) {
    return apiClient.getJson<unknown>(NEST_ADMIN_PATHS.semesters, token);
  },
  /** GET /admin/semester/{id}. */
  getSemester(id: string, token?: string) {
    return apiClient.getJson<unknown>(NEST_ADMIN_PATHS.semesterById(id), token);
  },
  /**
   * PATCH /admin/semester/{id} — بدنهٔ کامل شامل گیت.
   * لایو ممکن است ۲۰۴ یا سند خام mongoose بدهد؛ بدنه را مصرف نکن.
   */
  updateSemester(id: string, body: NestUpdateSemesterDto, token?: string) {
    return apiClient.patchMaybeJson<unknown>(
      NEST_ADMIN_PATHS.semesterById(id),
      body,
      token
    );
  },
  /** DELETE /admin/semester/{id} — لایو ۲۰۰ با بدنهٔ خالی. */
  deleteSemester(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(
      NEST_ADMIN_PATHS.semesterById(id),
      token
    );
  },

  /** GET /admin/semesters_all?structure=semester|podmani — آرایهٔ خام با درس/هفتهٔ تو در تو. */
  listSemestersAll(structure: NestSemesterAllStructure, token?: string) {
    return apiClient.getJson<NestSemesterWithLessons[]>(
      NEST_ADMIN_PATHS.semestersAll,
      token,
      { searchParams: toSearchParams({ structure }) }
    );
  },

  /** GET /admin/weeks/lesson/{lessonId} — آرایهٔ `{ id, lessonId, priority, status }`. */
  listWeeksByLesson(lessonId: string, token?: string) {
    return apiClient.getJson<unknown>(
      NEST_ADMIN_PATHS.weeksByLesson(lessonId),
      token
    );
  },

  /** PATCH /admin/lessons/{id}/status — فلگ ارائه/ظرفیت/روز یک درس؛ لایو ۲۰۴. */
  patchLessonStatus(
    id: string,
    body: NestPatchLessonStatusDto,
    token?: string
  ) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonStatusById(id),
      body,
      token
    );
  },

  /** PATCH /admin/lessons/status — آرایهٔ به‌روزرسانی چند درس؛ لایو ۲۰۴. */
  patchLessonsStatus(body: NestUpdateLessonItemDto[], token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonsStatus,
      body,
      token
    );
  },

  /** PUT /admin/lessons/{lessonId}/weeks — جایگزینی همهٔ هفته‌ها؛ لایو ۲۰۴. */
  putLessonWeeks(
    lessonId: string,
    body: NestPutLessonWeeksDto,
    token?: string
  ) {
    return apiClient.putMaybeJson<null>(
      NEST_ADMIN_PATHS.lessonWeeks(lessonId),
      body,
      token
    );
  },

  /** POST /admin/weeks — یک هفته؛ لایو ۲۰۴. */
  createWeek(body: NestCreateWeekDto, token?: string) {
    return apiClient.postMaybeJson<null>(NEST_ADMIN_PATHS.weeks, body, token);
  },

  /** PATCH /admin/weeks/{id} — لایو ۲۰۴. */
  updateWeek(id: string, body: NestUpdateWeekDto, token?: string) {
    return apiClient.patchMaybeJson<null>(
      NEST_ADMIN_PATHS.weekById(id),
      body,
      token
    );
  },

  /**
   * DELETE /admin/weeks/{id} — تست‌شده روی محیط لایو: این مسیر اصلاً وجود ندارد
   * (۴۰۴ «Cannot DELETE»؛ فقط PATCH روی `/admin/weeks/{id}` تعریف شده).
   * فعلاً هیچ‌جا صدا زده نمی‌شود — `planNestWeekWrites` عمداً `deletions` را
   * همیشه خالی برمی‌گرداند (ببین real-syllabus-mappers.ts). اگر آن رفتار
   * تغییر کند، این متد باید حذف/جایگزین شود، نه فعال.
   */
  deleteWeek(id: string, token?: string) {
    return apiClient.deleteMaybeJson<null>(NEST_ADMIN_PATHS.weekById(id), token);
  },
};
