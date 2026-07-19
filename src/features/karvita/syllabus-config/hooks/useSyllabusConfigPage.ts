'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTerm,
  CourseOfferingCatalogItem,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { computeOfferedTitles, errorMessage } from './syllabusPageUtils';
import { useSyllabusTermSettings } from './useSyllabusTermSettings';
import { useSyllabusWeeksEditor } from './useSyllabusWeeksEditor';

export function useSyllabusConfigPage() {
  const [tab, setTab] = useState<SyllabusConfigSubTab>('course_offerings');
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [selectedTermTitle, setSelectedTermTitle] = useState('');
  const [selectedCourse, setSelectedCourse] =
    useState<CourseOfferingCatalogItem | null>(null);
  const [weeks, setWeeks] = useState<SyllabusWeek[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [offeredTitles, setOfferedTitles] = useState<Set<string>>(new Set());
  const [professorCapacity, setProfessorCapacity] = useState('15');
  const [passingThreshold, setPassingThreshold] = useState('70');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);

  const selectedTerm = useMemo(
    () => terms.find((t) => t.title === selectedTermTitle) ?? null,
    [terms, selectedTermTitle]
  );

  const courses = useMemo(
    () => SyllabusConfigService.getCoursesForTerm(selectedTerm),
    [selectedTerm]
  );

  const isSelectedCourseOffered = Boolean(
    selectedCourse && offeredTitles.has(selectedCourse.title)
  );

  const applySnapshot = useCallback(
    async (
      snapshot: Awaited<ReturnType<typeof SyllabusConfigService.getSnapshot>>
    ) => {
      setTerms(snapshot.terms);
      setSelectedTermTitle(snapshot.selectedTermTitle);
      setProfessorCapacity(String(snapshot.globalProfessorCapacity));
      setPassingThreshold(String(snapshot.passingScoreThreshold));

      const term =
        snapshot.terms.find((t) => t.title === snapshot.selectedTermTitle) ??
        snapshot.terms[0] ??
        null;
      const courseList = SyllabusConfigService.getCoursesForTerm(term);
      const firstCourse = courseList[0] ?? null;
      setSelectedCourse(firstCourse);

      if (term && firstCourse) {
        const nextWeeks = await SyllabusConfigService.getOrSeedWeeks(
          term.title,
          firstCourse.title,
          firstCourse.type
        );
        setWeeks(nextWeeks);
        setOfferedTitles(computeOfferedTitles(term.title, courseList));
      } else {
        setWeeks([]);
        setOfferedTitles(new Set());
      }
      setHasUnsavedChanges(false);
    },
    []
  );

  const reload = useCallback(async () => {
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
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [applySnapshot]);

  useEffect(() => {
    const requestId = ++loadRequestIdRef.current;
    void (async () => {
      try {
        const snapshot = await SyllabusConfigService.getSnapshot();
        if (requestId !== loadRequestIdRef.current) return;
        await applySnapshot(snapshot);
      } catch (err) {
        if (requestId !== loadRequestIdRef.current) return;
        setError(errorMessage(err, 'بارگذاری تنظیمات ترم ناموفق بود.'));
      } finally {
        if (requestId === loadRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    })();
  }, [applySnapshot]);

  const selectTerm = useCallback(
    async (termTitle: string) => {
      try {
        await SyllabusConfigService.selectTerm(termTitle);
        setSelectedTermTitle(termTitle);
        const term = terms.find((t) => t.title === termTitle) ?? null;
        const courseList = SyllabusConfigService.getCoursesForTerm(term);
        const first = courseList[0] ?? null;
        setSelectedCourse(first);
        if (term && first) {
          const nextWeeks = await SyllabusConfigService.getOrSeedWeeks(
            term.title,
            first.title,
            first.type
          );
          setWeeks(nextWeeks);
          setOfferedTitles(computeOfferedTitles(term.title, courseList));
        } else {
          setWeeks([]);
          setOfferedTitles(new Set());
        }
        setHasUnsavedChanges(false);
      } catch (err) {
        toast.error(errorMessage(err, 'انتخاب ترم ناموفق بود.'));
      }
    },
    [terms]
  );

  const selectCourse = useCallback(
    async (course: CourseOfferingCatalogItem) => {
      if (!selectedTermTitle) return;
      setSelectedCourse(course);
      try {
        const nextWeeks = await SyllabusConfigService.getOrSeedWeeks(
          selectedTermTitle,
          course.title,
          course.type
        );
        setWeeks(nextWeeks);
        setHasUnsavedChanges(false);
      } catch (err) {
        toast.error(errorMessage(err, 'بارگذاری سرفصل ناموفق بود.'));
      }
    },
    [selectedTermTitle]
  );

  const toggleEnroll = useCallback(
    async (open: boolean) => {
      if (!selectedTermTitle) return;
      try {
        const snapshot = await SyllabusConfigService.updateTermGates({
          termTitle: selectedTermTitle,
          isEnrollOpen: open,
        });
        setTerms(snapshot.terms);
        toast.success(
          open
            ? 'فرآیند انتخاب واحد پورتال فعال گردید.'
            : 'فرآیند انتخاب واحد موقتاً مسدود شد.'
        );
      } catch (err) {
        toast.error(errorMessage(err, 'تغییر وضعیت انتخاب واحد ناموفق بود.'));
      }
    },
    [selectedTermTitle]
  );

  const toggleTermOpen = useCallback(
    async (open: boolean) => {
      if (!selectedTermTitle) return;
      try {
        const snapshot = await SyllabusConfigService.updateTermGates({
          termTitle: selectedTermTitle,
          isTermOpen: open,
        });
        setTerms(snapshot.terms);
        toast.success(
          open
            ? 'برگزاری کلاس‌های ترم فعال شد.'
            : 'برگزاری کلاس‌های ترم موقتاً غیرفعال شد.'
        );
      } catch (err) {
        toast.error(errorMessage(err, 'تغییر وضعیت برگزاری کلاس ناموفق بود.'));
      }
    },
    [selectedTermTitle]
  );

  const toggleCourseOffering = useCallback(
    async (course: CourseOfferingCatalogItem) => {
      if (!selectedTermTitle) return;
      try {
        await SyllabusConfigService.toggleCourseOffering({
          termTitle: selectedTermTitle,
          course,
        });
        const wasOffered = offeredTitles.has(course.title);
        setOfferedTitles(
          computeOfferedTitles(
            selectedTermTitle,
            SyllabusConfigService.getCoursesForTerm(selectedTerm)
          )
        );
        if (selectedCourse?.title === course.title) {
          const nextWeeks = await SyllabusConfigService.getOrSeedWeeks(
            selectedTermTitle,
            course.title,
            course.type
          );
          setWeeks(nextWeeks);
          setHasUnsavedChanges(false);
        }
        toast[wasOffered ? 'warning' : 'success'](
          wasOffered
            ? `ارائه درس «${course.title}» در این نیم‌سال متوقف شد.`
            : `درس «${course.title}» با موفقیت برای این نیم‌سال ارائه شد.`
        );
      } catch (err) {
        toast.error(errorMessage(err, 'تغییر وضعیت ارائه درس ناموفق بود.'));
      }
    },
    [offeredTitles, selectedCourse, selectedTerm, selectedTermTitle]
  );

  const weeksEditor = useSyllabusWeeksEditor({
    selectedTermTitle,
    selectedCourse,
    courses,
    weeks,
    setWeeks,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setOfferedTitles,
    isSelectedCourseOffered,
    setIsSaving,
  });

  const termSettings = useSyllabusTermSettings({
    terms,
    setTerms,
    setSelectedTermTitle,
    selectTerm,
    setIsSaving,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
  });

  return {
    tab,
    changeTab: (next: SyllabusConfigSubTab) => setTab(next),
    terms,
    selectedTerm,
    selectedTermTitle,
    selectTerm,
    courses,
    selectedCourse,
    selectCourse,
    offeredTitles,
    weeks,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    error,
    reload,
    toggleEnroll,
    toggleTermOpen,
    toggleCourseOffering,
    isSelectedCourseOffered,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
    ...weeksEditor,
    ...termSettings,
  };
}

export type UseSyllabusConfigPageReturn = ReturnType<
  typeof useSyllabusConfigPage
>;
