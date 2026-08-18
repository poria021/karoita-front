'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { QUERY_STALE_MS } from '@/lib/query-stale';
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

export const syllabusSnapshotQueryKey = ['syllabus-config', 'snapshot'] as const;

/**
 * Snapshot + term-context loading via TanStack Query (snapshot) + race-guarded
 * term context fetches. Chrome stays mounted; only data regions use `isLoading`
 * busy (rule 84). Snapshot re-apply is mount/reload only so unsaved edits survive
 * background refetch.
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
  const appliedSnapshotAtRef = useRef(0);
  const sectionRef = useRef(section);
  const stateRefs = useRef({
    selectedTermId,
    audience,
    selectedCourseId: selectedCourse?.id,
  });

  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  useEffect(() => {
    stateRefs.current = {
      selectedTermId,
      audience,
      selectedCourseId: selectedCourse?.id,
    };
  }, [audience, selectedCourse?.id, selectedTermId]);

  const snapshotQuery = useQuery({
    queryKey: syllabusSnapshotQueryKey,
    queryFn: () => SyllabusConfigService.getSnapshot(),
    staleTime: QUERY_STALE_MS.module,
  });

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
    const { selectedTermId: preferredTermId, audience: currentAudience } =
      stateRefs.current;
    const currentSection = sectionRef.current;

    setTerms(snapshot.terms);
    setProfessorCapacity(String(snapshot.globalProfessorCapacity));
    setPassingThreshold(String(snapshot.passingScoreThreshold));

    const preferredPool =
      currentSection === 'course_offerings'
        ? snapshot.terms.filter((term) => term.type === currentAudience)
        : snapshot.terms;
    const pool = preferredPool.length > 0 ? preferredPool : snapshot.terms;

    const term = pool[0]
      ? pool.find((t) => t.id === preferredTermId) ?? pool[0]
      : null;

    const termId = term?.id ?? '';
    setSelectedTermId(termId);
    return termId;
  }

  async function applySnapshot(
    snapshot: Awaited<ReturnType<typeof SyllabusConfigService.getSnapshot>>
  ) {
    const currentSection = sectionRef.current;
    const { audience: currentAudience, selectedCourseId } = stateRefs.current;
    const termId = applySnapshotTerms(snapshot);
    if (currentSection === 'term_settings') {
      setIsLoading(false);
      persistCache({
        terms: snapshot.terms,
        selectedTermId: termId,
        audience: currentAudience,
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
      const ctx = await loadTermContext(termId, selectedCourseId);
      persistCache({
        terms: snapshot.terms,
        selectedTermId: termId,
        audience: currentAudience,
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
        audience: currentAudience,
        selectedCourse: null,
        courses: [],
        weeks: [],
        offeredCatalogIds: new Set(),
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
    }
  }

  useEffect(() => {
    if (!snapshotQuery.isSuccess || !snapshotQuery.data) return;
    if (appliedSnapshotAtRef.current === snapshotQuery.dataUpdatedAt) return;
    // First paint / remount only — skip background soft-refetch re-apply.
    if (appliedSnapshotAtRef.current !== 0) return;

    const requestId = ++loadRequestIdRef.current;
    appliedSnapshotAtRef.current = snapshotQuery.dataUpdatedAt;
    void (async () => {
      try {
        if (requestId !== loadRequestIdRef.current) return;
        await applySnapshot(snapshotQuery.data);
        if (requestId !== loadRequestIdRef.current) return;
        setError(null);
      } catch (err) {
        if (requestId !== loadRequestIdRef.current) return;
        setError(errorMessage(err, 'بارگذاری تنظیمات ترم ناموفق بود.'));
        setIsLoading(false);
      }
    })();
    // intentional: apply once per mount from Query cache/fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount bootstrap from Query
  }, [snapshotQuery.isSuccess, snapshotQuery.data, snapshotQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!snapshotQuery.isError || !snapshotQuery.error) return;
    if (appliedSnapshotAtRef.current !== 0) return;
    setError(
      errorMessage(snapshotQuery.error, 'بارگذاری تنظیمات ترم ناموفق بود.')
    );
    setIsLoading(false);
  }, [snapshotQuery.isError, snapshotQuery.error]);

  async function reload() {
    const requestId = ++loadRequestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await snapshotQuery.refetch();
      if (requestId !== loadRequestIdRef.current) return;
      if (result.error) {
        setError(
          errorMessage(result.error, 'بارگذاری تنظیمات ترم ناموفق بود.')
        );
        setIsLoading(false);
        return;
      }
      if (!result.data) {
        setIsLoading(false);
        return;
      }
      appliedSnapshotAtRef.current = Date.now();
      await applySnapshot(result.data);
    } catch (err) {
      if (requestId !== loadRequestIdRef.current) return;
      setError(errorMessage(err, 'بارگذاری تنظیمات ترم ناموفق بود.'));
      setIsLoading(false);
    }
  }

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
