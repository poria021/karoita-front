import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  toNestSemesterDto,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import {
  getRealAcademicSettings,
  listRealTerms,
} from '@/services/syllabus-config/real/real-syllabus-reads';
import type {
  AcademicTerm,
  SyllabusConfigSnapshot,
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
  return _buildRealSnapshot();
}

/**
 * DELETE /admin/semester/:id — delete a semester by id.
 * Returns the refreshed snapshot after deletion.
 */
export async function deleteRealTerm(id: string): Promise<SyllabusConfigSnapshot> {
  await adminCatalogApi.deleteSemester(id);
  return _buildRealSnapshot();
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
  // Re-read to confirm the persisted value (Nest may round or coerce the number).
  const updated = await getRealAcademicSettings();
  return _buildRealSnapshot(
    undefined,
    updated.globalProfessorCapacity,
    updated.passingScoreThreshold
  );
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
  const updated = await getRealAcademicSettings();
  return _buildRealSnapshot(
    undefined,
    updated.globalProfessorCapacity,
    updated.passingScoreThreshold
  );
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Composite real-mode snapshot builder.  Offerings / internships / course-catalog
 * have no Nest surface yet — real snapshots always return empty collections there.
 */
async function _buildRealSnapshot(
  terms?: AcademicTerm[],
  globalProfessorCapacity?: number,
  passingScoreThreshold?: number
): Promise<SyllabusConfigSnapshot> {
  const [resolvedTerms, settings] = await Promise.all([
    terms !== undefined ? Promise.resolve(terms) : listRealTerms(),
    globalProfessorCapacity !== undefined && passingScoreThreshold !== undefined
      ? Promise.resolve({
          globalProfessorCapacity,
          passingScoreThreshold,
        })
      : getRealAcademicSettings(),
  ]);

  return {
    terms: resolvedTerms,
    offerings: {},
    internships: [],
    globalProfessorCapacity:
      globalProfessorCapacity ?? settings.globalProfessorCapacity,
    passingScoreThreshold:
      passingScoreThreshold ?? settings.passingScoreThreshold,
  };
}
