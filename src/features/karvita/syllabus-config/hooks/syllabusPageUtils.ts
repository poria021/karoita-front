import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { CourseOfferingCatalogItem } from '@/types/syllabus-config';

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function computeOfferedTitles(
  termTitle: string,
  courseList: CourseOfferingCatalogItem[]
): Set<string> {
  const offered = new Set<string>();
  for (const item of courseList) {
    if (SyllabusConfigService.isCourseOffered(termTitle, item.title)) {
      offered.add(item.title);
    }
  }
  return offered;
}
