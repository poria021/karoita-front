'use client';

import { useMemo, useState } from 'react';

import type {
  AcademicTermType,
  SyllabusConfigSubTab,
} from '@/types/syllabus-config';

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
    audience,
    setAudience,
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
  } = state;

  const [isSaving, setIsSaving] = useState(false);

  const { isLoading, reload, loadTermContext, loadTermContextForUi, error } =
    useSyllabusPageLoader({ section, state });

  const audienceTerms = useMemo(
    () => terms.filter((term) => term.type === audience),
    [audience, terms]
  );

  /** Gate cards (انتخاب واحد / برگزاری) follow the live selection even across tabs. */
  const selectedTerm =
    terms.find((t) => t.id === selectedTermId) ?? null;
  /** Semester picker only shows a term when it belongs to the active audience tab. */
  const selectedAudienceTerm =
    audienceTerms.find((t) => t.id === selectedTermId) ?? null;
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

  function changeAudience(next: AcademicTermType) {
    if (next === audience) return;
    setAudience(next);
    const match = terms.filter((term) => term.type === next);
    if (match.some((term) => term.id === selectedTermId)) return;
    const first = match[0];
    if (first) {
      navigation.selectTerm(first.id);
      return;
    }
    setSelectedTermId('');
    setSelectedCourse(null);
    setCourses([]);
    setWeeks([]);
    setOfferedCatalogIds(new Set());
    setHasUnsavedChanges(false);
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
    setIsSaving,
  });

  const termSettings = useSyllabusTermSettings({
    terms,
    setTerms,
    setSelectedTermId,
    loadTermContext: loadTermContextForUi,
    professorCapacity,
    setProfessorCapacity,
    passingThreshold,
    setPassingThreshold,
  });

  return {
    section,
    terms,
    audienceTerms,
    audience,
    changeAudience,
    selectedTerm,
    selectedAudienceTerm,
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
