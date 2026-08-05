'use client';

import { useEffect, useState } from 'react';

import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  AcademicTerm,
  CourseCatalogItem,
  SyllabusConfigSubTab,
  SyllabusWeek,
} from '@/types/syllabus-config';

import {
  cacheKeyFor,
  type SyllabusPageCache,
} from '../lib/syllabusPageCache';

/**
 * Hydrate syllabus page domain state from the dashboard module cache
 * and keep a soft-refresh snapshot in memory (rule 83 / 84).
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

  useEffect(() => {
    if (terms.length === 0) return;
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
    setData,
  ]);

  return {
    hasCache,
    terms,
    setTerms,
    selectedTermId,
    setSelectedTermId,
    selectedCourse,
    setSelectedCourse,
    courses,
    setCourses,
    weeks,
    setWeeks,
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
