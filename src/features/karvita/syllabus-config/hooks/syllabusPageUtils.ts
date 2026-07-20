import type { CourseOfferingListItem } from '@/types/syllabus-config';

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
