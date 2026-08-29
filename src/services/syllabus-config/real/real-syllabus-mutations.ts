import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  planNestWeekWrites,
  toNestSemesterDto,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import {
  findRealLessonIdsForTerm,
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

/**
 * POST /admin/semester — create a new semester and return the refreshed snapshot.
 */
export async function createRealTerm(
  input: UpsertTermInput
): Promise<SyllabusConfigSnapshot> {
  const body = toNestSemesterDto(input);
  await adminCatalogApi.createSemester(body);
  return getRealSyllabusSnapshot();
}

/**
 * PATCH /admin/semester/{id} then GET the same id.
 * Live PATCH body is a Mongoose dump — do not map it.
 */
export async function updateRealTerm(
  id: string,
  input: UpsertTermInput
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.updateSemester(id, toNestSemesterDto(input));
  await adminCatalogApi.getSemester(id);
  return getRealSyllabusSnapshot();
}

/**
 * DELETE /admin/semester/:id — delete a semester by id.
 * Returns the refreshed snapshot after deletion.
 */
export async function deleteRealTerm(
  id: string
): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.deleteSemester(id);
  return getRealSyllabusSnapshot();
}

/**
 * POST /admin/settings — Nest has no PATCH endpoint; each write inserts a new
 * settings row and GET always returns the latest one.
 * We read the current values first so the complementary field is preserved.
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

/**
 * POST /admin/settings — same insert semantics as setRealProfessorCapacity.
 */
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

/** PATCH /admin/lessons/{id}/status — `status` is the ارائه flag. */
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
 * Term-level switches: one PATCH /admin/lessons/status array.
 * انتخاب واحد → `courseSelection`, برگزاری کلاس → `startClasses`.
 */
export async function updateRealTermGates(
  input: UpdateTermGatesInput
): Promise<SyllabusConfigSnapshot> {
  const lessonIds = await findRealLessonIdsForTerm(input.termId);
  if (lessonIds.length === 0) {
    throw new Error('درسی برای این ترم یافت نشد.');
  }

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

  await adminCatalogApi.patchLessonsStatus(
    lessonIds.map((id) => ({ id, ...patch }))
  );
  return getRealSyllabusSnapshot();
}

/**
 * POST /admin/weeks + PATCH /admin/weeks/{id}.
 * New editor rows create; existing rows update; removed remote rows archive.
 */
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
