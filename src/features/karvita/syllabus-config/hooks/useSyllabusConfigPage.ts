'use client';

import { useState } from 'react';

import type { SyllabusConfigSubTab } from '@/types/syllabus-config';

import { useSyllabusOfferingGates } from './useSyllabusOfferingGates';
import { useSyllabusPageLoader } from './useSyllabusPageLoader';
import { useSyllabusPageState } from './useSyllabusPageState';
import { useSyllabusTermSettings } from './useSyllabusTermSettings';
import { useSyllabusUnsavedNavigation } from './useSyllabusUnsavedNavigation';
import { useSyllabusWeeksEditor } from './useSyllabusWeeksEditor';

export function useSyllabusConfigPage(section: SyllabusConfigSubTab) {
  const state = useSyllabusPageState(section);
  const {
    terms,
    setTerms,
    selectedTermId,
    setSelectedTermId,
    selectedCourse,
    setSelectedCourse,
    courses,
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
  } = state;

  const [isSaving, setIsSaving] = useState(false);

  const { isLoading, reload, loadTermContext, loadTermContextForUi, error } =
    useSyllabusPageLoader({ section, state });

  const selectedTerm =
    terms.find((t) => t.id === selectedTermId) ?? null;
  const isSelectedCourseOffered = Boolean(
    selectedCourse && offeredCatalogIds.has(selectedCourse.id)
  );

  const navigation = useSyllabusUnsavedNavigation({
    hasUnsavedChanges,
    selectedTermId,
    selectedCourse,
    setSelectedTermId,
    setSelectedCourse,
    setWeeks,
    setHasUnsavedChanges,
    loadTermContext,
  });

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
    selectTerm: navigation.selectTerm,
    courses,
    selectedCourse,
    selectCourse: navigation.selectCourse,
    offeredCatalogIds,
    weeks,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    error,
    reload,
    isSelectedCourseOffered,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
    pendingNavigation: navigation.pendingNavigation,
    clearPendingNavigation: navigation.clearPendingNavigation,
    confirmDiscardAndNavigate: navigation.confirmDiscardAndNavigate,
    ...offeringGates,
    ...weeksEditor,
    ...termSettings,
  };
}

export type UseSyllabusConfigPageReturn = ReturnType<
  typeof useSyllabusConfigPage
>;
