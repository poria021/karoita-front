import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  planNestWeekWrites,
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

export async function createRealTerm(
  input: UpsertTermInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.createSemester(toNestSemesterDto(input));
  return getRealSyllabusSnapshot();
}

/**
 * `PATCH /admin/semester/{id}` سپس GET همان id.
 * بدنه باید کامل باشد تا گیت‌های زنده از بین نروند.
 */
export async function updateRealTerm(
  id: string,
  input: UpsertTermInput
): Promise<SyllabusConfigSnapshot> {
  const current = await adminCatalogApi.getSemester(id);
  await adminCatalogApi.updateSemester(id, toNestSemesterDto(input, current));
  await adminCatalogApi.getSemester(id);
  return getRealSyllabusSnapshot();
}

export async function deleteRealTerm(
  id: string
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.deleteSemester(id);
  return getRealSyllabusSnapshot();
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
  return getRealSyllabusSnapshot();
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
  return getRealSyllabusSnapshot();
}

/** `PATCH /admin/lessons/{id}/status` — `status` پرچم ارائه است. */
export async function activateRealOffering(
  input: ActivateOfferingInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.patchLessonStatus(input.courseCatalogId, {
    status: true,
  });
  return getRealSyllabusSnapshot();
}

export async function deactivateRealOffering(
  input: DeactivateOfferingInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.patchLessonStatus(input.courseOfferingId, {
    status: false,
  });
  return getRealSyllabusSnapshot();
}

/**
 * سوییچ سطح ترم: `PATCH /admin/semester/{id}` با بدنهٔ کامل.
 * انتخاب واحد → `courseSelection`؛ برگزاری کلاس → `startClasses`.
 */
export async function updateRealTermGates(
  input: UpdateTermGatesInput
): Promise<SyllabusConfigSnapshot> {
  const current = await adminCatalogApi.getSemester(input.termId);
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
  return getRealSyllabusSnapshot();
}

/** ردیف جدید create؛ موجود update؛ حذف‌شده از ادیتور بایگانی. */
export async function saveRealSyllabusWeeks(
  input: SaveSyllabusWeeksInput
): Promise<SyllabusConfigSnapshot> {
  const lessonId = input.courseCatalogId;
  const remote = await adminCatalogApi.listWeeksByLesson(lessonId);
  const plan = planNestWeekWrites(lessonId, input.weeks, remote);
  await Promise.all([
    ...plan.creates.map((body) => adminCatalogApi.createWeek(body)),
    ...plan.updates.map(({ id, body }) => adminCatalogApi.updateWeek(id, body)),
  ]);
  return getRealSyllabusSnapshot();
}
