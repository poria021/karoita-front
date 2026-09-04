import type { QueryClient } from '@tanstack/react-query';

import {
  DASHBOARD_QUERY,
  invalidateAcademicTermConsumers,
} from '@/lib/dashboard-query-keys';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  AcademicTerm,
  AcademicTermType,
  CourseCatalogItem,
  SyllabusConfigSnapshot,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

export function cacheKeyFor(section: SyllabusConfigSubTab): string {
  return `syllabus-config::${section}`;
}

/** کلید مشترک snapshot بین تنظیمات ترم و ارائه سرفصل. */
export const syllabusSnapshotQueryKey = DASHBOARD_QUERY.syllabusSnapshot;

export const SYLLABUS_DASHBOARD_CACHE_PREFIX = 'syllabus-config::';

/**
 * لیست ترم بین تعریف ترم و پیکربندی سرفصل مشترک است.
 * هر بخش کش صفحهٔ جدا دارد؛ بدون این sync، ماژول دیگر ترم حذف‌شده را نشان می‌دهد.
 */
export function syncSyllabusDashboardTerms(terms: AcademicTerm[]): void {
  const store = useDashboardModuleCache.getState();
  for (const key of Object.keys(store.data)) {
    if (!key.startsWith(SYLLABUS_DASHBOARD_CACHE_PREFIX)) continue;
    const page = store.getData<SyllabusPageCache>(key);
    if (!page || !Array.isArray(page.terms)) continue;
    const selectedStillExists = terms.some(
      (term) => term.id === page.selectedTermId
    );
    store.setData<SyllabusPageCache>(key, {
      ...page,
      terms,
      selectedTermId: selectedStillExists ? page.selectedTermId : '',
    });
  }
}

export function publishSyllabusSnapshot(
  queryClient: QueryClient,
  snapshot: SyllabusConfigSnapshot
): void {
  queryClient.setQueryData(syllabusSnapshotQueryKey, snapshot);
  syncSyllabusDashboardTerms(snapshot.terms);
  void invalidateAcademicTermConsumers(queryClient);
}

export function patchCachedSyllabusTerms(
  queryClient: QueryClient,
  terms: AcademicTerm[]
): void {
  queryClient.setQueryData<SyllabusConfigSnapshot>(
    syllabusSnapshotQueryKey,
    (old) => (old ? { ...old, terms } : old)
  );
  syncSyllabusDashboardTerms(terms);
  void invalidateAcademicTermConsumers(queryClient);
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
  isWeeksPublished?: boolean;
  offeredCatalogIds: string[];
  professorCapacity: string;
  passingThreshold: string;
};
