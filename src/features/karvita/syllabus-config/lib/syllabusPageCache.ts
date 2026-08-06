import type {
  AcademicTerm,
  AcademicTermType,
  CourseCatalogItem,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

export function cacheKeyFor(section: SyllabusConfigSubTab): string {
  return `syllabus-config::${section}`;
}

export type PendingNavigation =
  | { kind: 'term'; termId: string }
  | { kind: 'course'; course: CourseCatalogItem }
  | null;

export type SyllabusPageCache = {
  terms: AcademicTerm[];
  selectedTermId: string;
  /** مخاطب فیلتر ارائه سرفصل: ترمی=دانشجو، پودمانی=مهارت‌آموز. */
  audience?: AcademicTermType;
  selectedCourse: CourseCatalogItem | null;
  courses: CourseCatalogItem[];
  weeks: SyllabusWeek[];
  offeredCatalogIds: string[];
  professorCapacity: string;
  passingThreshold: string;
};
