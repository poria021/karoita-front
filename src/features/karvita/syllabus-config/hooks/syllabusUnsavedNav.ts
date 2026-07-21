import type { CourseCatalogItem } from '@/types/syllabus-config';

import type { PendingNavigation } from './syllabusPageCache';

export type UnsavedNavDecision = 'noop' | 'defer' | 'commit';

/**
 * Decide whether a term switch is a no-op, needs discard confirm, or commits now.
 */
export function decideUnsavedTermSelect(
  termId: string,
  selectedTermId: string,
  hasUnsavedChanges: boolean
): UnsavedNavDecision {
  if (termId === selectedTermId) return 'noop';
  if (hasUnsavedChanges) return 'defer';
  return 'commit';
}

/**
 * Decide whether a course switch is a no-op, needs discard confirm, or commits now.
 */
export function decideUnsavedCourseSelect(
  courseId: string,
  selectedCourseId: string | undefined,
  hasUnsavedChanges: boolean
): UnsavedNavDecision {
  if (selectedCourseId === courseId) return 'noop';
  if (hasUnsavedChanges) return 'defer';
  return 'commit';
}

export function pendingTermNavigation(termId: string): PendingNavigation {
  return { kind: 'term', termId };
}

export function pendingCourseNavigation(
  course: CourseCatalogItem
): PendingNavigation {
  return { kind: 'course', course };
}
