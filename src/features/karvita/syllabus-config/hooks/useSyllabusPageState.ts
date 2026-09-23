'use client';

import { useEffect, useState } from 'react';

import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  AcademicTerm,
  AcademicTermType,
  CourseCatalogItem,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import {
  cacheKeyFor,
  type SyllabusPageCache,
} from '../lib/syllabusPageCache';

/**
 * state دامنهٔ صفحهٔ سرفصل را از کش ماژول داشبورد hydrate می‌کند
 * و اسنپ‌شات soft-refresh را در حافظه نگه می‌دارد.
 */
export function useSyllabusPageState(section: SyllabusConfigSubTab) {
  const cacheKey = cacheKeyFor(section);
  const getData = useDashboardModuleCache((s) => s.getData);
  const setData = useDashboardModuleCache((s) => s.setData);
  const cached = getData<SyllabusPageCache>(cacheKey);
  const hasCache = Boolean(cached && cached.terms.length > 0);

  const [terms, setTerms] = useState<AcademicTerm[]>(() => cached?.terms ?? []);
  const [selectedTermId, setSelectedTermId] = useState(
    () => cached?.selectedTermId ?? ''
  );
  const [audience, setAudience] = useState<AcademicTermType>(
    () => cached?.audience ?? 'semester'
  );
  const [selectedCourse, setSelectedCourse] =
    useState<CourseCatalogItem | null>(() => cached?.selectedCourse ?? null);
  const [courses, setCourses] = useState<CourseCatalogItem[]>(
    () => cached?.courses ?? []
  );
  const [weeks, setWeeks] = useState<SyllabusWeek[]>(() => cached?.weeks ?? []);
  const [isWeeksPublished, setIsWeeksPublished] = useState(
    () => cached?.isWeeksPublished ?? false
  );
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

  function persistCache(next: {
    terms: AcademicTerm[];
    selectedTermId: string;
    audience?: AcademicTermType;
    selectedCourse?: CourseCatalogItem | null;
    courses?: CourseCatalogItem[];
    weeks?: SyllabusWeek[];
    isWeeksPublished?: boolean;
    offeredCatalogIds: Set<string>;
    professorCapacity?: string;
    passingThreshold?: string;
  }) {
    setData<SyllabusPageCache>(cacheKey, {
      terms: next.terms,
      selectedTermId: next.selectedTermId,
      audience: next.audience ?? audience,
      selectedCourse:
        next.selectedCourse !== undefined
          ? next.selectedCourse
          : selectedCourse,
      courses: next.courses ?? courses,
      weeks: next.weeks ?? weeks,
      isWeeksPublished: next.isWeeksPublished ?? isWeeksPublished,
      offeredCatalogIds: [...next.offeredCatalogIds],
      professorCapacity: next.professorCapacity ?? professorCapacity,
      passingThreshold: next.passingThreshold ?? passingThreshold,
    });
  }

  useEffect(() => {
    if (terms.length === 0) return;
    setData<SyllabusPageCache>(cacheKey, {
      terms,
      selectedTermId,
      audience,
      selectedCourse,
      courses,
      weeks,
      isWeeksPublished,
      offeredCatalogIds: [...offeredCatalogIds],
      professorCapacity,
      passingThreshold,
    });
  }, [
    cacheKey,
    terms,
    selectedTermId,
    audience,
    selectedCourse,
    courses,
    weeks,
    isWeeksPublished,
    offeredCatalogIds,
    professorCapacity,
    passingThreshold,
    setData,
  ]);

  return {
    hasCache,
    terms,
    setTerms,
    selectedTermId,
    setSelectedTermId,
    audience,
    setAudience,
    selectedCourse,
    setSelectedCourse,
    courses,
    setCourses,
    weeks,
    setWeeks,
    isWeeksPublished,
    setIsWeeksPublished,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    offeredCatalogIds,
    setOfferedCatalogIds,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
    persistCache,
  };
}

export type UseSyllabusPageStateReturn = ReturnType<typeof useSyllabusPageState>;
