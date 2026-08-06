'use client';

import { useEffect, useRef, useState } from 'react';

import { delayDashboardColdSkeletonPreview } from '@/lib/dashboard-cold-skeleton-preview';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { offeredCatalogIdsFromList, errorMessage } from '../lib/syllabusPageUtils';
import type { UseSyllabusPageStateReturn } from './useSyllabusPageState';

type UseSyllabusPageLoaderArgs = {
  section: SyllabusConfigSubTab;
  state: UseSyllabusPageStateReturn;
};

/**
 * Snapshot + term-context loading with race guards.
 * Chrome stays mounted; only data regions use `isLoading` busy (rule 84).
 */
export function useSyllabusPageLoader({
  section,
  state,
}: UseSyllabusPageLoaderArgs) {
  const {
    hasCache,
    selectedTermId,
    audience,
    selectedCourse,
    setTerms,
    setSelectedTermId,
    setSelectedCourse,
    setCourses,
    setWeeks,
    setHasUnsavedChanges,
    setOfferedCatalogIds,
    setProfessorCapacity,
    setPassingThreshold,
    persistCache,
  } = state;

  const [isLoading, setIsLoading] = useState(!hasCache);
  const [error, setError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);

  async function loadTermContext(termId: string, preferredCourseId?: string) {
    setIsLoading(true);
    try {
      const [courseList, offerings] = await Promise.all([
        SyllabusConfigService.listCoursesForTerm(termId),
        SyllabusConfigService.listOfferings(termId),
      ]);
      setCourses(courseList);
      const offered = offeredCatalogIdsFromList(offerings);
      setOfferedCatalogIds(offered);

      const nextCourse =
        courseList.find((c) => c.id === preferredCourseId) ??
        courseList[0] ??
        null;
      setSelectedCourse(nextCourse);

      let nextWeeks: SyllabusWeek[] = [];
      if (nextCourse) {
        nextWeeks = await SyllabusConfigService.getWeeks(
          termId,
          nextCourse.id
        );
        setWeeks(nextWeeks);
      } else {
        setWeeks([]);
      }
      setHasUnsavedChanges(false);
      return {
        courses: courseList,
        selectedCourse: nextCourse,
        weeks: nextWeeks,
        offeredCatalogIds: offered,
      };
    } finally {
      setIsLoading(false);
    }
  }

  function applySnapshotTerms(
    snapshot: Awaited<ReturnType<typeof SyllabusConfigService.getSnapshot>>
  ): string {
    setTerms(snapshot.terms);
    setProfessorCapacity(String(snapshot.globalProfessorCapacity));
    setPassingThreshold(String(snapshot.passingScoreThreshold));

    const preferredPool =
      section === 'course_offerings'
        ? snapshot.terms.filter((term) => term.type === audience)
        : snapshot.terms;
    const pool = preferredPool.length > 0 ? preferredPool : snapshot.terms;

    const term = pool[0]
      ? pool.find((t) => t.id === selectedTermId) ?? pool[0]
      : null;

    const termId = term?.id ?? '';
    setSelectedTermId(termId);
    return termId;
  }

  async function applySnapshot(
    snapshot: Awaited<ReturnType<typeof SyllabusConfigService.getSnapshot>>
  ) {
    const termId = applySnapshotTerms(snapshot);
    if (section === 'term_settings') {
      setIsLoading(false);
      persistCache({
        terms: snapshot.terms,
        selectedTermId: termId,
        audience,
        selectedCourse: null,
        courses: [],
        weeks: [],
        offeredCatalogIds: new Set(),
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
      return;
    }

    if (termId) {
      const ctx = await loadTermContext(termId, selectedCourse?.id);
      persistCache({
        terms: snapshot.terms,
        selectedTermId: termId,
        audience,
        selectedCourse: ctx.selectedCourse,
        courses: ctx.courses,
        weeks: ctx.weeks,
        offeredCatalogIds: ctx.offeredCatalogIds,
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
    } else {
      setCourses([]);
      setSelectedCourse(null);
      setWeeks([]);
      setOfferedCatalogIds(new Set());
      setHasUnsavedChanges(false);
      setIsLoading(false);
      persistCache({
        terms: snapshot.terms,
        selectedTermId: '',
        audience,
        selectedCourse: null,
        courses: [],
        weeks: [],
        offeredCatalogIds: new Set(),
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
    }
  }

  async function reload() {
    const requestId = ++loadRequestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await SyllabusConfigService.getSnapshot();
      if (requestId !== loadRequestIdRef.current) return;
      await applySnapshot(snapshot);
    } catch (err) {
      if (requestId !== loadRequestIdRef.current) return;
      setError(errorMessage(err, 'بارگذاری تنظیمات ترم ناموفق بود.'));
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const requestId = ++loadRequestIdRef.current;
    void (async () => {
      try {
        await delayDashboardColdSkeletonPreview(!hasCache);
        if (requestId !== loadRequestIdRef.current) return;
        const snapshot = await SyllabusConfigService.getSnapshot();
        if (requestId !== loadRequestIdRef.current) return;
        await applySnapshot(snapshot);
      } catch (err) {
        if (requestId !== loadRequestIdRef.current) return;
        setError(errorMessage(err, 'بارگذاری تنظیمات ترم ناموفق بود.'));
        setIsLoading(false);
      }
    })();
    // initial mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount bootstrap
  }, []);

  async function loadTermContextForUi(
    termId: string,
    preferredCourseId?: string
  ): Promise<void> {
    if (section === 'term_settings') {
      setSelectedTermId(termId);
      return;
    }
    await loadTermContext(termId, preferredCourseId);
  }

  return {
    isLoading,
    setIsLoading,
    error,
    reload,
    loadTermContext,
    loadTermContextForUi,
  };
}
