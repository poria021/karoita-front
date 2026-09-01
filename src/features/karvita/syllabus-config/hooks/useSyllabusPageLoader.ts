'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  CourseCatalogItem,
  SyllabusConfigSnapshot,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import {
  errorMessage,
  offeredCatalogIdsFromList,
  type SyllabusTermPane,
} from '../lib/syllabusPageUtils';
import type { UseSyllabusPageStateReturn } from './useSyllabusPageState';

type UseSyllabusPageLoaderArgs = {
  section: SyllabusConfigSubTab;
  state: UseSyllabusPageStateReturn;
};

export const syllabusSnapshotQueryKey = ['syllabus-config', 'snapshot'] as const;

type TermContextResult = {
  courses: CourseCatalogItem[];
  selectedCourse: CourseCatalogItem | null;
  weeks: SyllabusWeek[];
  offeredCatalogIds: Set<string>;
};

/**
 * بارگذاری snapshot با TanStack Query + pane ترم در حافظه
 * تا عوض‌کردن تب مخاطب SPA بماند (بدون refetch / شلوغی جدول).
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
    courses,
    weeks,
    offeredCatalogIds,
    hasUnsavedChanges,
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

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(!hasCache);
  const [error, setError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);
  const appliedSnapshotAtRef = useRef(0);
  const termPanesRef = useRef<Record<string, SyllabusTermPane>>({});
  const sectionRef = useRef(section);
  const stateRefs = useRef({
    selectedTermId,
    audience,
    selectedCourse,
    courses,
    weeks,
    offeredCatalogIds,
    hasUnsavedChanges,
  });

  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  useEffect(() => {
    stateRefs.current = {
      selectedTermId,
      audience,
      selectedCourse,
      courses,
      weeks,
      offeredCatalogIds,
      hasUnsavedChanges,
    };
  }, [
    audience,
    courses,
    hasUnsavedChanges,
    offeredCatalogIds,
    selectedCourse,
    selectedTermId,
    weeks,
  ]);

  const snapshotQuery = useQuery({
    queryKey: syllabusSnapshotQueryKey,
    queryFn: () => SyllabusConfigService.getSnapshot(),
    staleTime: QUERY_STALE_MS.module,
  });

  function stashCurrentTermPane() {
    const current = stateRefs.current;
    if (!current.selectedTermId) return;
    termPanesRef.current[current.selectedTermId] = {
      selectedTermId: current.selectedTermId,
      selectedCourse: current.selectedCourse,
      courses: current.courses,
      weeks: current.weeks,
      offeredCatalogIds: [...current.offeredCatalogIds],
      hasUnsavedChanges: current.hasUnsavedChanges,
    };
  }

  function applyTermPane(pane: SyllabusTermPane): TermContextResult {
    const offered = new Set(pane.offeredCatalogIds);
    setSelectedTermId(pane.selectedTermId);
    setSelectedCourse(pane.selectedCourse);
    setCourses(pane.courses);
    setWeeks(pane.weeks);
    setOfferedCatalogIds(offered);
    setHasUnsavedChanges(pane.hasUnsavedChanges);
    return {
      courses: pane.courses,
      selectedCourse: pane.selectedCourse,
      weeks: pane.weeks,
      offeredCatalogIds: offered,
    };
  }

  function rememberTermPane(result: TermContextResult, termId: string) {
    termPanesRef.current[termId] = {
      selectedTermId: termId,
      selectedCourse: result.selectedCourse,
      courses: result.courses,
      weeks: result.weeks,
      offeredCatalogIds: [...result.offeredCatalogIds],
      hasUnsavedChanges: false,
    };
  }

  function resolveSnapshot(
    explicit?: SyllabusConfigSnapshot
  ): SyllabusConfigSnapshot | undefined {
    return (
      explicit ??
      queryClient.getQueryData<SyllabusConfigSnapshot>(syllabusSnapshotQueryKey)
    );
  }

  async function loadTermContext(
    termId: string,
    preferredCourseId?: string,
    options?: { force?: boolean; snapshot?: SyllabusConfigSnapshot }
  ): Promise<TermContextResult> {
    const previousId = stateRefs.current.selectedTermId;
    if (previousId && previousId !== termId) {
      stashCurrentTermPane();
    }

    if (!options?.force) {
      const pane = termPanesRef.current[termId];
      if (
        pane &&
        (pane.courses.length === 0 ||
          pane.courses.some((course) => course.title.trim().length > 0))
      ) {
        setIsLoading(false);
        return applyTermPane(pane);
      }
    }

    const snapshot = resolveSnapshot(options?.snapshot);
    const fromSnapshot = snapshot
      ? SyllabusConfigService.termContextFromSnapshot(snapshot, termId)
      : null;

    if (!fromSnapshot) {
      setIsLoading(true);
    }

    try {
      const { courses: courseList, offerings } =
        fromSnapshot ??
        (await SyllabusConfigService.listCoursesAndOfferingsForTerm(termId));
      const offered = offeredCatalogIdsFromList(offerings);
      setCourses(courseList);
      setOfferedCatalogIds(offered);

      const nextCourse =
        courseList.find((c) => c.id === preferredCourseId) ??
        courseList[0] ??
        null;
      setSelectedCourse(nextCourse);
      setSelectedTermId(termId);

      let nextWeeks: SyllabusWeek[] = [];
      if (nextCourse && snapshot) {
        nextWeeks = SyllabusConfigService.weeksFromSnapshot(
          snapshot,
          termId,
          nextCourse.id
        );
        setWeeks(nextWeeks);
      } else if (!nextCourse) {
        setWeeks([]);
      }

      setHasUnsavedChanges(false);
      setIsLoading(false);

      if (nextCourse) {
        const remoteWeeks = await SyllabusConfigService.getWeeks(
          termId,
          nextCourse.id
        );
        if (stateRefs.current.selectedTermId !== termId) {
          return {
            courses: courseList,
            selectedCourse: nextCourse,
            weeks: nextWeeks,
            offeredCatalogIds: offered,
          };
        }
        nextWeeks = remoteWeeks;
        setWeeks(remoteWeeks);
      }

      const result: TermContextResult = {
        courses: courseList,
        selectedCourse: nextCourse,
        weeks: nextWeeks,
        offeredCatalogIds: offered,
      };
      rememberTermPane(result, termId);
      return result;
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
    const { audience: currentAudience, selectedCourse: currentCourse } =
      stateRefs.current;
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
      const ctx = await loadTermContext(termId, currentCourse?.id, {
        snapshot,
      });
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
    // فقط اولین رنگ / remount — اعمال مجدد soft-refetch پس‌زمینه را رد کن.
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
    // عمدی: یک‌بار روی mount از کش/fetch کوئری اعمال شود
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap روی mount از Query
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
    termPanesRef.current = {};
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
