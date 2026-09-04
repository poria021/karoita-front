'use client';

import { useMemo, useRef, useState } from 'react';

import type {
  AcademicTermType,
  SyllabusConfigSubTab,
} from '@/types/syllabus-config';

import { resolveAudienceTermId } from '../lib/syllabusPageUtils';

import { useSyllabusOfferingGates } from './useSyllabusOfferingGates';
import { useSyllabusPageLoader } from './useSyllabusPageLoader';
import { useSyllabusPageState } from './useSyllabusPageState';
import { useSyllabusTermSettings } from './useSyllabusTermSettings';
import { useSyllabusUnsavedNavigation } from './useSyllabusUnsavedNavigation';
import { useSyllabusWeeksDraft } from './useSyllabusWeeksDraft';
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
  } = state;

  const [isSaving, setIsSaving] = useState(false);

  const { isLoading, reload, loadTermContext, loadTermContextForUi, error } =
    useSyllabusPageLoader({ section, state });
  const lastTermByAudienceRef = useRef<Partial<Record<AcademicTermType, string>>>(
    {}
  );

  const audienceTerms = useMemo(
    () => terms.filter((term) => term.type === audience),
    [audience, terms]
  );

  /** کارت گیت (انتخاب واحد / برگزاری) انتخاب زنده را حتی بین تب‌ها دنبال می‌کند. */
  const selectedTerm =
    terms.find((t) => t.id === selectedTermId) ?? null;
  /** picker نیم‌سال فقط ترمی را نشان می‌دهد که مال تب مخاطب فعال باشد. */
  const selectedAudienceTerm =
    audienceTerms.find((t) => t.id === selectedTermId) ?? null;
  const isSelectedCourseOffered = Boolean(
    selectedCourse && offeredCatalogIds.has(selectedCourse.id)
  );

  const weeksDraft = useSyllabusWeeksDraft({
    selectedTermId,
    selectedCourse,
    weeks,
    setWeeks,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  });

  const navigation = useSyllabusUnsavedNavigation({
    hasUnsavedChanges,
    selectedTermId,
    selectedCourse,
    setSelectedTermId,
    setSelectedCourse,
    setWeeks,
    setIsWeeksPublished,
    setHasUnsavedChanges,
    loadTermContext,
    clearSyllabusWeeksDraft: weeksDraft.clearDraft,
  });

  function changeAudience(next: AcademicTermType) {
    if (next === audience) return;
    lastTermByAudienceRef.current[audience] = selectedTermId;
    setAudience(next);
    const match = terms.filter((term) => term.type === next);
    const termId = resolveAudienceTermId(
      match,
      lastTermByAudienceRef.current[next]
    );
    if (!termId) {
      setSelectedTermId('');
      setSelectedCourse(null);
      setCourses([]);
      setWeeks([]);
      setIsWeeksPublished(false);
      setOfferedCatalogIds(new Set());
      weeksDraft.clearDraft();
      setHasUnsavedChanges(false);
      return;
    }
    lastTermByAudienceRef.current[next] = termId;
    void loadTermContext(termId);
  }

  const offeringGates = useSyllabusOfferingGates({
    selectedTermId,
    selectedTerm,
    selectedCourse,
    offeredCatalogIds,
    setTerms,
    setWeeks,
    setIsWeeksPublished,
    setOfferedCatalogIds,
    setHasUnsavedChanges,
  });

  const weeksEditor = useSyllabusWeeksEditor({
    selectedTermId,
    selectedCourse,
    weeks,
    setWeeks,
    isWeeksPublished,
    setIsWeeksPublished,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setIsSaving,
    clearSyllabusWeeksDraft: weeksDraft.clearDraft,
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
    isWeeksPublished,
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
