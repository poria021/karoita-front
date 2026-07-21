'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { SyllabusConfigService } from '@/services/syllabus-config.service';
import { delayDashboardColdSkeletonPreview } from '@/lib/dashboard-cold-skeleton-preview';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  AcademicTerm,
  CourseCatalogItem,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { errorMessage, offeredCatalogIdsFromList } from './syllabusPageUtils';
import { useSyllabusOfferingGates } from './useSyllabusOfferingGates';
import { useSyllabusTermSettings } from './useSyllabusTermSettings';
import { useSyllabusWeeksEditor } from './useSyllabusWeeksEditor';

function cacheKeyFor(section: SyllabusConfigSubTab): string {
  return `syllabus-config::${section}`;
}

type PendingNavigation =
  | { kind: 'term'; termId: string }
  | { kind: 'course'; course: CourseCatalogItem }
  | null;

type SyllabusPageCache = {
  terms: AcademicTerm[];
  selectedTermId: string;
  selectedCourse: CourseCatalogItem | null;
  courses: CourseCatalogItem[];
  weeks: SyllabusWeek[];
  offeredCatalogIds: string[];
  professorCapacity: string;
  passingThreshold: string;
};

export function useSyllabusConfigPage(section: SyllabusConfigSubTab) {
  const cacheKey = cacheKeyFor(section);
  const getData = useDashboardModuleCache((s) => s.getData);
  const setData = useDashboardModuleCache((s) => s.setData);
  const cached = getData<SyllabusPageCache>(cacheKey);
  const hasCache = Boolean(cached && cached.terms.length > 0);

  const [terms, setTerms] = useState<AcademicTerm[]>(() => cached?.terms ?? []);
  const [selectedTermId, setSelectedTermId] = useState(
    () => cached?.selectedTermId ?? ''
  );
  const [selectedCourse, setSelectedCourse] =
    useState<CourseCatalogItem | null>(() => cached?.selectedCourse ?? null);
  const [courses, setCourses] = useState<CourseCatalogItem[]>(
    () => cached?.courses ?? []
  );
  const [weeks, setWeeks] = useState<SyllabusWeek[]>(() => cached?.weeks ?? []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [offeredCatalogIds, setOfferedCatalogIds] = useState<Set<string>>(
    () => new Set(cached?.offeredCatalogIds ?? [])
  );
  const [professorCapacity, setProfessorCapacity] = useState(
    () => cached?.professorCapacity ?? '15'
  );
  const [passingThreshold, setPassingThreshold] = useState(
    () => cached?.passingThreshold ?? '70'
  );
  const [isCold, setIsCold] = useState(!hasCache);
  const [isLoading, setIsLoading] = useState(!hasCache);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation>(null);
  const loadRequestIdRef = useRef(0);

  const selectedTerm =
    terms.find((t) => t.id === selectedTermId) ?? null;
  const isSelectedCourseOffered = Boolean(
    selectedCourse && offeredCatalogIds.has(selectedCourse.id)
  );

  function persistCache(next: {
    terms: AcademicTerm[];
    selectedTermId: string;
    selectedCourse?: CourseCatalogItem | null;
    courses?: CourseCatalogItem[];
    weeks?: SyllabusWeek[];
    offeredCatalogIds: Set<string>;
    professorCapacity?: string;
    passingThreshold?: string;
  }) {
    setData<SyllabusPageCache>(cacheKey, {
      terms: next.terms,
      selectedTermId: next.selectedTermId,
      selectedCourse:
        next.selectedCourse !== undefined
          ? next.selectedCourse
          : selectedCourse,
      courses: next.courses ?? courses,
      weeks: next.weeks ?? weeks,
      offeredCatalogIds: [...next.offeredCatalogIds],
      professorCapacity: next.professorCapacity ?? professorCapacity,
      passingThreshold: next.passingThreshold ?? passingThreshold,
    });
  }

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

    const term = snapshot.terms[0]
      ? snapshot.terms.find((t) => t.id === selectedTermId) ??
        snapshot.terms[snapshot.terms.length > 1 ? 1 : 0] ??
        snapshot.terms[0]
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
        selectedCourse: null,
        courses: [],
        weeks: [],
        offeredCatalogIds: new Set(),
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
      setIsCold(false);
      return;
    }

    if (termId) {
      const ctx = await loadTermContext(termId, selectedCourse?.id);
      persistCache({
        terms: snapshot.terms,
        selectedTermId: termId,
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
        selectedCourse: null,
        courses: [],
        weeks: [],
        offeredCatalogIds: new Set(),
        professorCapacity: String(snapshot.globalProfessorCapacity),
        passingThreshold: String(snapshot.passingScoreThreshold),
      });
    }
    setIsCold(false);
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
      if (!hasCache && terms.length === 0) setIsCold(true);
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
        if (!hasCache) setIsCold(true);
      }
    })();
    // initial mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount bootstrap
  }, []);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (isCold || terms.length === 0) return;
    setData<SyllabusPageCache>(cacheKey, {
      terms,
      selectedTermId,
      selectedCourse,
      courses,
      weeks,
      offeredCatalogIds: [...offeredCatalogIds],
      professorCapacity,
      passingThreshold,
    });
  }, [
    cacheKey,
    terms,
    selectedTermId,
    selectedCourse,
    courses,
    weeks,
    offeredCatalogIds,
    professorCapacity,
    passingThreshold,
    isCold,
    setData,
  ]);

  async function commitSelectTerm(termId: string) {
    try {
      setSelectedTermId(termId);
      await loadTermContext(termId);
    } catch (err) {
      toast.error(errorMessage(err, 'انتخاب ترم ناموفق بود.'));
    }
  }

  async function commitSelectCourse(course: CourseCatalogItem) {
    if (!selectedTermId) return;
    setSelectedCourse(course);
    try {
      const nextWeeks = await SyllabusConfigService.getWeeks(
        selectedTermId,
        course.id
      );
      setWeeks(nextWeeks);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error(errorMessage(err, 'بارگذاری سرفصل ناموفق بود.'));
    }
  }

  function requestSelectTerm(termId: string) {
    if (termId === selectedTermId) return;
    if (hasUnsavedChanges) {
      setPendingNavigation({ kind: 'term', termId });
      return;
    }
    void commitSelectTerm(termId);
  }

  function requestSelectCourse(course: CourseCatalogItem) {
    if (selectedCourse?.id === course.id) return;
    if (hasUnsavedChanges) {
      setPendingNavigation({ kind: 'course', course });
      return;
    }
    void commitSelectCourse(course);
  }

  function clearPendingNavigation() {
    setPendingNavigation(null);
  }

  async function confirmDiscardAndNavigate() {
    const pending = pendingNavigation;
    setPendingNavigation(null);
    if (!pending) return;

    if (pending.kind === 'term') {
      await commitSelectTerm(pending.termId);
      return;
    }
    await commitSelectCourse(pending.course);
  }

  const offeringGates = useSyllabusOfferingGates({
    selectedTermId,
    selectedTerm,
    selectedCourse,
    offeredCatalogIds,
    setTerms,
    setWeeks,
    setOfferedCatalogIds,
    setHasUnsavedChanges,
  });

  const weeksEditor = useSyllabusWeeksEditor({
    selectedTermId,
    selectedCourse,
    weeks,
    setWeeks,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSelectedCourseOffered,
    setIsSaving,
  });

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

  const termSettings = useSyllabusTermSettings({
    terms,
    setTerms,
    setSelectedTermId,
    loadTermContext: loadTermContextForUi,
    setIsSaving,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
  });

  return {
    section,
    terms,
    selectedTerm,
    selectedTermId,
    selectTerm: requestSelectTerm,
    courses,
    selectedCourse,
    selectCourse: requestSelectCourse,
    offeredCatalogIds,
    weeks,
    hasUnsavedChanges,
    isCold,
    isLoading,
    isSaving,
    error,
    reload,
    isSelectedCourseOffered,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
    pendingNavigation,
    clearPendingNavigation,
    confirmDiscardAndNavigate,
    ...offeringGates,
    ...weeksEditor,
    ...termSettings,
  };
}

export type UseSyllabusConfigPageReturn = ReturnType<
  typeof useSyllabusConfigPage
>;
