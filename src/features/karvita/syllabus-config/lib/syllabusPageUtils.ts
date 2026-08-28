import type {
  AcademicTerm,
  CourseCatalogItem,
  CourseOfferingListItem,
  SyllabusWeek,
} from '@/types/syllabus-config';

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function offeredCatalogIdsFromList(
  offerings: CourseOfferingListItem[]
): Set<string> {
  const next = new Set<string>();
  for (const item of offerings) {
    if (item.isOffered) next.add(item.courseCatalogId);
  }
  return next;
}

/** Last selected term for an audience tab — keep the SPA switch in-memory. */
export function resolveAudienceTermId(
  pool: AcademicTerm[],
  rememberedTermId: string | undefined
): string {
  if (rememberedTermId && pool.some((term) => term.id === rememberedTermId)) {
    return rememberedTermId;
  }
  return pool[0]?.id ?? '';
}

export type SyllabusTermPane = {
  selectedTermId: string;
  selectedCourse: CourseCatalogItem | null;
  courses: CourseCatalogItem[];
  weeks: SyllabusWeek[];
  offeredCatalogIds: string[];
  hasUnsavedChanges: boolean;
};
