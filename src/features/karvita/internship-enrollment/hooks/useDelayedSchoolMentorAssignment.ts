'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
} from '@/types/internship-enrollment';

type UseDelayedSchoolMentorAssignmentInput = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  onAssignmentComplete: () => Promise<void>;
};

export function useDelayedSchoolMentorAssignment({
  actor,
  state,
  onAssignmentComplete,
}: UseDelayedSchoolMentorAssignmentInput) {
  const [schoolQuery, setSchoolQuery] = useState('');
  const [mentorQuery, setMentorQuery] = useState('');
  const [schools, setSchools] = useState<InternshipSchoolCapacity[]>([]);
  const [mentors, setMentors] = useState<InternshipMentorCapacity[]>([]);
  const [selectedSchool, setSelectedSchool] =
    useState<InternshipSchoolCapacity | null>(null);
  const [selectedMentor, setSelectedMentor] =
    useState<InternshipMentorCapacity | null>(null);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedSchoolQuery = useDebouncedValue(
    schoolQuery,
    SEARCH_DEBOUNCE_MS
  );
  const debouncedMentorQuery = useDebouncedValue(
    mentorQuery,
    SEARCH_DEBOUNCE_MS
  );
  const schoolListQuery = resolveListSearchQuery(
    schoolQuery,
    debouncedSchoolQuery
  );
  const mentorListQuery = resolveListSearchQuery(
    mentorQuery,
    debouncedMentorQuery
  );

  useEffect(() => {
    let cancelled = false;
    void InternshipEnrollmentService.listDelayedSchools({
      actor,
      level: state.level,
      query: schoolListQuery,
    })
      .then((items) => {
        if (!cancelled) setSchools(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSchools([]);
          toast.error(
            error instanceof Error
              ? error.message
              : 'بارگذاری فهرست مدارس ناموفق بود.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSchools(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, schoolListQuery, state.level]);

  useEffect(() => {
    if (!selectedSchool) return;

    let cancelled = false;
    void InternshipEnrollmentService.listDelayedMentors({
      actor,
      level: state.level,
      schoolId: selectedSchool.id,
      query: mentorListQuery,
    })
      .then((items) => {
        if (!cancelled) setMentors(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMentors([]);
          toast.error(
            error instanceof Error
              ? error.message
              : 'بارگذاری فهرست معلمان ناظر ناموفق بود.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMentors(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, mentorListQuery, selectedSchool, state.level]);

  const selectSchool = useCallback((school: InternshipSchoolCapacity) => {
    setSelectedSchool(school);
    setSchoolQuery(school.name);
    setSelectedMentor(null);
    setMentorQuery('');
    setMentors([]);
    setIsLoadingMentors(true);
  }, []);

  const setSchoolSearch = useCallback((value: string) => {
    setSchoolQuery(value);
    setSelectedSchool(null);
    setSelectedMentor(null);
    setMentorQuery('');
    setMentors([]);
    setIsLoadingSchools(true);
    setIsLoadingMentors(false);
  }, []);

  /** Match original: focus opens picker and clears confirmed school/mentor, keeps typed school text. */
  const beginSchoolPick = useCallback(() => {
    setSelectedSchool(null);
    setSelectedMentor(null);
    setMentorQuery('');
    setMentors([]);
  }, []);

  const selectMentor = useCallback((mentor: InternshipMentorCapacity) => {
    setSelectedMentor(mentor);
    setMentorQuery(mentor.name);
  }, []);

  const setMentorSearch = useCallback((value: string) => {
    setMentorQuery(value);
    setSelectedMentor(null);
    setIsLoadingMentors(true);
  }, []);

  const validateSchoolSelection = useCallback(() => {
    if (selectedSchool) return;
    if (!schoolQuery.trim()) return;
    const exact = schools.find((school) => school.name === schoolQuery.trim());
    if (exact) {
      setSelectedSchool(exact);
      setIsLoadingMentors(true);
      return;
    }
    setSchoolQuery('');
  }, [schoolQuery, schools, selectedSchool]);

  const validateMentorSelection = useCallback(() => {
    if (selectedMentor) return;
    if (!mentorQuery.trim()) return;
    const exact = mentors.find((mentor) => mentor.name === mentorQuery.trim());
    if (exact) {
      setSelectedMentor(exact);
      return;
    }
    setMentorQuery('');
  }, [mentorQuery, mentors, selectedMentor]);

  const submit = useCallback(async () => {
    if (!selectedSchool || !selectedMentor) {
      toast.warning('لطفاً ابتدا مدرسه و معلم راهنما را انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      await InternshipEnrollmentService.assignDelayedSchoolMentor({
        actor,
        kind: state.kind,
        level: state.level,
        termId: state.termId,
        schoolId: selectedSchool.id,
        mentorId: selectedMentor.id,
      });
      toast.success('مشخصات مدرسه، مربی و روزهای حضور با موفقیت ثبت شد.');
      await onAssignmentComplete();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'ثبت تخصیص مدرسه و معلم راهنما ناموفق بود.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    actor,
    onAssignmentComplete,
    selectedMentor,
    selectedSchool,
    state.kind,
    state.level,
    state.termId,
  ]);

  return {
    schoolQuery,
    mentorQuery,
    schools,
    mentors,
    selectedSchool,
    selectedMentor,
    isLoadingSchools,
    isLoadingMentors,
    isSubmitting,
    setSchoolSearch,
    setMentorSearch,
    beginSchoolPick,
    selectSchool,
    selectMentor,
    validateSchoolSelection,
    validateMentorSelection,
    submit,
  };
}
