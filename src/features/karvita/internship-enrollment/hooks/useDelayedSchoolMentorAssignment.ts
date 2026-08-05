'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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
  const debouncedSchoolQuery = useDebouncedValue(schoolQuery, 250);
  const debouncedMentorQuery = useDebouncedValue(mentorQuery, 250);

  useEffect(() => {
    let cancelled = false;
    void InternshipEnrollmentService.listDelayedSchools({
      actor,
      level: state.level,
      query: debouncedSchoolQuery,
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
  }, [actor, debouncedSchoolQuery, state.level]);

  useEffect(() => {
    if (!selectedSchool) return;

    let cancelled = false;
    void InternshipEnrollmentService.listDelayedMentors({
      actor,
      level: state.level,
      schoolId: selectedSchool.id,
      query: debouncedMentorQuery,
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
  }, [actor, debouncedMentorQuery, selectedSchool, state.level]);

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

  const selectMentor = useCallback((mentor: InternshipMentorCapacity) => {
    setSelectedMentor(mentor);
    setMentorQuery(mentor.name);
  }, []);

  const setMentorSearch = useCallback((value: string) => {
    setMentorQuery(value);
    setSelectedMentor(null);
    setIsLoadingMentors(true);
  }, []);

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
    selectSchool,
    selectMentor,
    submit,
  };
}
