import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  toAcademicSettings,
  toAcademicTerm,
  type RealAcademicSettings,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import type {
  AcademicTerm,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';

export type { RealAcademicSettings };

/** GET /admin/semester — bare array, no paging envelope. */
export async function listRealTerms(): Promise<AcademicTerm[]> {
  const rows = await adminCatalogApi.listSemesters();
  return rows.map(toAcademicTerm);
}

/**
 * GET /admin/settings — latest inserted row.
 * Falls back to safe defaults when the settings collection is still empty
 * (first-time setup before any POST /admin/settings call).
 */
export async function getRealAcademicSettings(): Promise<RealAcademicSettings> {
  try {
    const settings = await adminCatalogApi.getAcademicSettings();
    return toAcademicSettings(settings);
  } catch {
    // Nest returns 404/500 when no settings row exists yet — return defaults.
    return { globalProfessorCapacity: 0, passingScoreThreshold: 0 };
  }
}

/**
 * Composite snapshot for real mode. Offerings/internships/course-catalog
 * reads have no Nest surface yet (see SyllabusConfigService Nest map) — real
 * snapshots always come back empty there.
 */
export async function getRealSyllabusSnapshot(): Promise<SyllabusConfigSnapshot> {
  const [terms, settings] = await Promise.all([
    listRealTerms(),
    getRealAcademicSettings(),
  ]);
  return {
    terms,
    offerings: {},
    internships: [],
    globalProfessorCapacity: settings.globalProfessorCapacity,
    passingScoreThreshold: settings.passingScoreThreshold,
  };
}
