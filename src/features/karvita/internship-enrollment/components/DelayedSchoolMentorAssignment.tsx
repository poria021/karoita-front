'use client';

import { useMemo } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSearchableOrganizationSelect } from '@/components/shared/fields/KvSearchableOrganizationSelect';
import { useDelayedSchoolMentorAssignment } from '@/features/karvita/internship-enrollment/hooks/useDelayedSchoolMentorAssignment';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
} from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';

type DelayedSchoolMentorAssignmentProps = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  supervisorName: string;
  disabled: boolean;
  onAssignmentComplete: () => Promise<void>;
};

export function DelayedSchoolMentorAssignment({
  actor,
  state,
  supervisorName,
  disabled,
  onAssignmentComplete,
}: DelayedSchoolMentorAssignmentProps) {
  const assignment = useDelayedSchoolMentorAssignment({
    actor,
    state,
    onAssignmentComplete,
  });
  const mentorLocked = disabled || !assignment.selectedSchool;

  const schoolOptions = useMemo(
    () =>
      assignment.schools.map((school) => ({
        id: school.id,
        label: school.name,
      })),
    [assignment.schools]
  );
  const mentorOptions = useMemo(
    () =>
      assignment.mentors.map((mentor) => ({
        id: mentor.id,
        label: mentor.name,
      })),
    [assignment.mentors]
  );

  return (
    <fieldset
      disabled={disabled}
      className="mt-kv-pair flex w-full flex-col rounded-kv-card border border-dashed border-kv-warning-border bg-kv-warning-soft/80 p-kv-group shadow-kv-raised lg:max-w-[750px]"
    >
      <div className="mb-kv-group w-full border-b border-kv-warning-border/40 pb-kv-group">
        <div className="flex w-full flex-col items-stretch gap-kv-inline text-xs text-kv-text-secondary lg:flex-row lg:items-center">
          <div className="flex w-full shrink-0 items-center justify-between border-b border-kv-border pb-kv-pair font-medium select-none lg:w-auto lg:justify-start lg:border-b-0 lg:pb-0">
            <span>استاد راهنما:</span>
            <strong className="ms-kv-pair rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
              {supervisorName}
            </strong>
          </div>

          <div className="relative z-20 flex w-full flex-col items-start sm:flex-row sm:items-center lg:flex-1">
            <span className="mb-1 shrink-0 font-bold sm:mb-0 sm:me-kv-pair">
              مدرسه همکار:
            </span>
            <div className="w-full min-w-0 flex-1">
              <KvSearchableOrganizationSelect
                label={false}
                placeholder="جستجوی نام مدرسه..."
                locked={disabled}
                value={assignment.selectedSchool?.id ?? ''}
                options={schoolOptions}
                allowEmpty
                isLoading={assignment.isLoadingSchools}
                emptyLabel="مدرسه‌ای در حوزهٔ شما یافت نشد."
                onQueryChange={(query) => {
                  assignment.setSchoolSearch(query);
                }}
                onChange={(id) => {
                  if (!id) return;
                  const school = assignment.schools.find((row) => row.id === id);
                  if (school) assignment.selectSchool(school);
                }}
              />
            </div>
          </div>

          <div className="relative z-10 flex w-full flex-col items-start sm:flex-row sm:items-center lg:flex-1">
            <span className="mb-1 shrink-0 font-bold sm:mb-0 sm:me-kv-pair">
              معلم ناظر:
            </span>
            <div className="w-full min-w-0 flex-1">
              <KvSearchableOrganizationSelect
                label={false}
                placeholder="جستجوی نام مربی..."
                locked={mentorLocked}
                value={assignment.selectedMentor?.id ?? ''}
                options={mentorOptions}
                allowEmpty
                isLoading={assignment.isLoadingMentors}
                emptyLabel="معلم ناظری برای این مدرسه یافت نشد."
                onQueryChange={(query) => {
                  if (mentorLocked) return;
                  assignment.setMentorSearch(query);
                }}
                onChange={(id) => {
                  if (!id) return;
                  const mentor = assignment.mentors.find((row) => row.id === id);
                  if (mentor) assignment.selectMentor(mentor);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-stretch gap-kv-group sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-kv-pair text-xs text-kv-warning-soft-fg sm:max-w-[22rem] sm:items-center">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-warning-soft text-kv-warning-soft-fg shadow-kv-soft"
            aria-hidden
          >
            <FaIcon icon={faIcons.triangleExclamation} size="sm" />
          </span>
          <p className="leading-relaxed font-medium">
            بعد از مشخص شدن مدرسه محل حضور و معلم آن‌ها را در این فرم ثبت نمایید
          </p>
        </div>

        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          size="sm"
          fullWidth
          className="sm:w-auto"
          loading={assignment.isSubmitting}
          disabled={
            disabled ||
            !assignment.selectedSchool ||
            !assignment.selectedMentor
          }
          icon={<FaIcon icon={faIcons.link} size="2xs" />}
          onClick={() => void assignment.submit()}
        >
          ثبت نهایی و تخصیص مدرسه همکار
        </KvButton>
      </div>
    </fieldset>
  );
}
