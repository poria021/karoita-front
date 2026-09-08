'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  CourseCatalogItem,
  SyllabusConfigSnapshot,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import {
  getSyllabusTermPaneEpoch,
  syllabusSnapshotQueryKey,
} from '../lib/syllabusPageCache';
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

export { syllabusSnapshotQueryKey };

type TermContextResult = {
  courses: CourseCatalogItem[];
  selectedCourse: CourseCatalogItem | null;
  weeks: SyllabusWeek[];
  isWeeksPublished: boolean;
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
    isWeeksPublished,
    offeredCatalogIds,
    hasUnsavedChanges,
    setTerms,
    setSelectedTermId,
    setSelectedCourse,
    setCourses,
    setWeeks,
    setIsWeeksPublished,
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
  const termPaneEpochRef = useRef(getSyllabusTermPaneEpoch());
  const termPanesRef = useRef<Record<string, SyllabusTermPane>>({});
  const sectionRef = useRef(section);
  const stateRefs = useRef({
    selectedTermId,
    audience,
    selectedCourse,
    courses,
    weeks,
    isWeeksPublished,
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
      isWeeksPublished,
      offeredCatalogIds,
      hasUnsavedChanges,
    };
  }, [
    audience,
    courses,
    hasUnsavedChanges,
    isWeeksPublished,
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
      isWeeksPublished: current.isWeeksPublished,
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
    setIsWeeksPublished(pane.isWeeksPublished);
    setOfferedCatalogIds(offered);
    setHasUnsavedChanges(pane.hasUnsavedChanges);
    return {
      courses: pane.courses,
      selectedCourse: pane.selectedCourse,
      weeks: pane.weeks,
      isWeeksPublished: pane.isWeeksPublished,
      offeredCatalogIds: offered,
    };
  }

  function rememberTermPane(result: TermContextResult, termId: string) {
    termPanesRef.current[termId] = {
      selectedTermId: termId,
      selectedCourse: result.selectedCourse,
      courses: result.courses,
      weeks: result.weeks,
      isWeeksPublished: result.isWeeksPublished,
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

    const termPaneEpoch = getSyllabusTermPaneEpoch();
    const paneIsFresh = termPaneEpochRef.current === termPaneEpoch;

    if (!options?.force && paneIsFresh) {
      const pane = termPanesRef.current[termId];
      // پانل خالی (صفر درس) هرگز به‌عنوان کش معتبر پذیرفته نمی‌شود، چون ممکن
      // است ترم به‌تازگی ساخته شده و offering هایش هنوز از سرور نرسیده باشند؛
      // در آن صورت باید دوباره از admin/semesters_all فچ شود (مثل termContextFromSnapshot).
      if (pane && pane.courses.length > 0) {
        setIsLoading(false);
        const result = applyTermPane(pane);
        // اگر کش می‌گوید هفته‌ها ثبت نشده، از سرور تأیید بگیر تا cache mismatch
        // منجر به drop شدن بی‌صدای هفته‌های جدید در planNestWeekWrites نشود.
        if (!pane.isWeeksPublished && pane.selectedCourse) {
          const termIdForVerify = termId;
          const courseIdForVerify = pane.selectedCourse.id;
          void SyllabusConfigService.getWeeks(termIdForVerify, courseIdForVerify)
            .then((loaded) => {
              if (!loaded.isPublished) return;
              setWeeks(loaded.weeks);
              setIsWeeksPublished(true);
              const stale = termPanesRef.current[termIdForVerify];
              if (stale) {
                termPanesRef.current[termIdForVerify] = {
                  ...stale,
                  weeks: loaded.weeks,
                  isWeeksPublished: true,
                };
              }
            })
            .catch(() => {});
        }
        return result;
      }
    }

    const snapshot = resolveSnapshot(options?.snapshot);
    const fromSnapshot = snapshot
      ? SyllabusConfigService.termContextFromSnapshot(snapshot, termId)
      : null;

    termPaneEpochRef.current = getSyllabusTermPaneEpoch();

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
      let nextPublished = false;
      if (!nextCourse) {
        setWeeks([]);
        setIsWeeksPublished(false);
      }

      setHasUnsavedChanges(false);

      if (nextCourse) {
        const loaded = await SyllabusConfigService.getWeeks(
          termId,
          nextCourse.id
        );
        if (stateRefs.current.selectedTermId !== termId) {
          return {
            courses: courseList,
            selectedCourse: nextCourse,
            weeks: nextWeeks,
            isWeeksPublished: nextPublished,
            offeredCatalogIds: offered,
          };
        }
        nextWeeks = loaded.weeks;
        nextPublished = loaded.isPublished;
        setWeeks(loaded.weeks);
        setIsWeeksPublished(loaded.isPublished);
        if (loaded.serverAlert) {
          toast.error(loaded.serverAlert);
        }
      }

      const result: TermContextResult = {
        courses: courseList,
        selectedCourse: nextCourse,
        weeks: nextWeeks,
        isWeeksPublished: nextPublished,
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

    // ارائه درس فقط از ترم‌های همان تب مخاطب؛ بدون fallback به نوع دیگر.
    const pool =
      currentSection === 'course_offerings'
        ? snapshot.terms.filter((term) => term.type === currentAudience)
        : snapshot.terms;

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
        isWeeksPublished: false,
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
        isWeeksPublished: ctx.isWeeksPublished,
        offeredCatalogIds: ctx.offeredCatalogIds,
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
    } else {
      setCourses([]);
      setSelectedCourse(null);
      setWeeks([]);
      setIsWeeksPublished(false);
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
        isWeeksPublished: false,
        offeredCatalogIds: new Set(),
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
    }
  }

  useEffect(() => {
    termPaneEpochRef.current = getSyllabusTermPaneEpoch();
  }, [section, snapshotQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!snapshotQuery.isSuccess || !snapshotQuery.data) return;
    if (appliedSnapshotAtRef.current === snapshotQuery.dataUpdatedAt) return;

    const isFirstApply = appliedSnapshotAtRef.current === 0;
    const requestId = ++loadRequestIdRef.current;
    appliedSnapshotAtRef.current = snapshotQuery.dataUpdatedAt;
    const snapshot = snapshotQuery.data;
    void (async () => {
      try {
        if (requestId !== loadRequestIdRef.current) return;
        if (isFirstApply) {
          await applySnapshot(snapshot);
        } else {
          // mutation از ماژول دیگر / setQueryData — ترم‌ها را هم‌گام کن،
          // ولی جدول هفته را با soft-refetch پس‌زمینه از نو نساز.
          const previousTermId = stateRefs.current.selectedTermId;
          const termId = applySnapshotTerms(snapshot);
          if (
            sectionRef.current === 'course_offerings' &&
            termId &&
            termId !== previousTermId
          ) {
            await loadTermContext(termId, undefined, {
              snapshot,
              force: true,
            });
          }
        }
        if (requestId !== loadRequestIdRef.current) return;
        setError(null);
      } catch (err) {
        if (requestId !== loadRequestIdRef.current) return;
        setError(errorMessage(err, 'بارگذاری تنظیمات ترم ناموفق بود.'));
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- اعمال snapshot از Query
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

  return {
    isLoading,
    setIsLoading,
    error,
    reload,
    loadTermContext,
  };
}
