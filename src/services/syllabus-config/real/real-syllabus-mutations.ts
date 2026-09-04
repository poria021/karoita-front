import { reloadAfterWrite } from '@/lib/post-commit-refresh';
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { ApiClientError } from '@/services/api-error';
import {
  parseNestLessonWeekList,
  parseNestSemester,
  planNestWeekWrites,
  toNestLessonWeeksBody,
  toNestSemesterDto,
  toNestSemesterWriteDto,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import {
  getRealAcademicSettings,
  getRealSyllabusSnapshot,
} from '@/services/syllabus-config/real/real-syllabus-reads';
import type {
  ActivateOfferingInput,
  DeactivateOfferingInput,
  SaveSyllabusWeeksInput,
  SyllabusConfigSnapshot,
  UpdateTermGatesInput,
  UpsertTermInput,
} from '@/types/syllabus-config';

async function loadSemesterForWrite(id: string) {
  const current = parseNestSemester(await adminCatalogApi.getSemester(id), id);
  if (!current) {
    throw new ApiClientError('دوره تحصیلی یافت نشد.', 404);
  }
  return current;
}

export async function createRealTerm(
  input: UpsertTermInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.createSemester(toNestSemesterDto(input));
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

/**
 * `PATCH /admin/semester/{id}` سپس snapshot.
 * بدنه باید کامل باشد تا گیت‌های زنده از بین نروند.
 * پاسخ PATCH لایو سند mongoose است — نادیده می‌گیریم و از GET لیست می‌خوانیم.
 */
export async function updateRealTerm(
  id: string,
  input: UpsertTermInput
): Promise<SyllabusConfigSnapshot> {
  const current = await loadSemesterForWrite(id);
  await adminCatalogApi.updateSemester(id, toNestSemesterDto(input, current));
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

export async function deleteRealTerm(
  id: string
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.deleteSemester(id);
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

/**
 * `POST /admin/settings` — Nest PATCH ندارد؛ هر نوشته ردیف جدید می‌سازد و GET آخرین را می‌دهد.
 * اول مقدار جاری را می‌خوانیم تا فیلد مکمل حفظ شود.
 */
export async function setRealProfessorCapacity(
  capacity: number
): Promise<SyllabusConfigSnapshot> {
  const current = await getRealAcademicSettings();
  await adminCatalogApi.createAcademicSettings({
    generalProfessorCapacity: capacity,
    systemPassingScore: current.passingScoreThreshold,
  });
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

/** همان درج `POST /admin/settings` مثل `setRealProfessorCapacity`. */
export async function setRealPassingThreshold(
  threshold: number
): Promise<SyllabusConfigSnapshot> {
  const current = await getRealAcademicSettings();
  await adminCatalogApi.createAcademicSettings({
    generalProfessorCapacity: current.globalProfessorCapacity,
    systemPassingScore: threshold,
  });
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

/** `PATCH /admin/lessons/{id}/status` — `status` پرچم ارائه است؛ ظرفیت/روز اختیاری‌اند. */
export async function activateRealOffering(
  input: ActivateOfferingInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.patchLessonStatus(input.courseCatalogId, {
    status: true,
  });
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

export async function deactivateRealOffering(
  input: DeactivateOfferingInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.patchLessonStatus(input.courseOfferingId, {
    status: false,
  });
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

/**
 * سوییچ سطح ترم: `PATCH /admin/semester/{id}` با بدنهٔ کامل.
 * انتخاب واحد → `courseSelection`؛ برگزاری کلاس → `startClasses`.
 */
export async function updateRealTermGates(
  input: UpdateTermGatesInput
): Promise<SyllabusConfigSnapshot> {
  const current = await loadSemesterForWrite(input.termId);
  const patch: {
    courseSelection?: boolean;
    startClasses?: boolean;
  } = {};
  if (input.isEnrollOpen !== undefined) {
    patch.courseSelection = input.isEnrollOpen;
  }
  if (input.isTermOpen !== undefined) {
    patch.startClasses = input.isTermOpen;
  }
  if (patch.courseSelection === undefined && patch.startClasses === undefined) {
    return getRealSyllabusSnapshot();
  }

  await adminCatalogApi.updateSemester(
    input.termId,
    toNestSemesterWriteDto(current, patch)
  );
  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}

/**
 * پیکربندی اول: `PUT /admin/lessons/{id}/weeks` با همان تعداد سطر ادیتور.
 * بعد از GET غیرخالی: فقط `PATCH` برای بایگانی/بازیابی.
 */
export async function saveRealSyllabusWeeks(
  input: SaveSyllabusWeeksInput
): Promise<SyllabusConfigSnapshot> {
  const lessonId = input.courseCatalogId;
  const remote = parseNestLessonWeekList(
    await adminCatalogApi.listWeeksByLesson(lessonId)
  );

  if (remote.length === 0) {
    if (input.weeks.length === 0) {
      throw new ApiClientError('برای ثبت سرفصل حداقل یک هفته لازم است.');
    }
    await adminCatalogApi.putLessonWeeks(
      lessonId,
      toNestLessonWeeksBody(input.weeks)
    );
    return reloadAfterWrite(() => getRealSyllabusSnapshot());
  }

  const plan = planNestWeekWrites(lessonId, input.weeks, remote);

  for (const id of plan.deletions) {
    await adminCatalogApi.deleteWeek(id);
  }
  for (const row of plan.updates) {
    await adminCatalogApi.updateWeek(row.id, row.body);
  }
  for (const body of plan.creates) {
    await adminCatalogApi.createWeek(body);
  }

  return reloadAfterWrite(() => getRealSyllabusSnapshot());
}
