'use client';

import { useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSearchableCombobox } from '@/components/shared/fields/KvSearchableCombobox';
import {
  DemoDataBadge,
  IS_DEMO_FALLBACK_ACTIVE,
  IS_REAL_MODE_STUB_ACTIVE,
  RealModeStubBadge,
} from '@/components/shared/RealModeStubNotice';
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
  const schoolFieldId = useId();
  const mentorFieldId = useId();
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const mentorLocked = disabled || IS_REAL_MODE_STUB_ACTIVE || !assignment.selectedSchool;
  const realModeDisabled = disabled || IS_REAL_MODE_STUB_ACTIVE;

  return (
    <fieldset
      disabled={realModeDisabled}
      className="mt-kv-pair flex w-full flex-col rounded-kv-card border border-dashed border-kv-brand-border bg-kv-brand-soft/70 p-kv-group shadow-kv-raised lg:max-w-[750px]"
    >
      {IS_REAL_MODE_STUB_ACTIVE ? (
        <div className="mb-kv-pair flex items-center gap-kv-pair">
          <RealModeStubBadge />
          <span className="text-xs text-kv-text-secondary">
            فهرست مدرسه/معلم همکار هنوز به API واقعی وصل نیست.
          </span>
        </div>
      ) : null}
      {IS_DEMO_FALLBACK_ACTIVE ? (
        <div className="mb-kv-pair flex items-center gap-kv-pair">
          <DemoDataBadge />
          <span className="text-xs text-kv-text-secondary">
            فهرست مدرسه/معلم همکار هنوز به Nest وصل نشده؛ این‌جا با داده‌ی نمایشی
            پر شده است.
          </span>
        </div>
      ) : null}
      <div className="mb-kv-group w-full border-b border-kv-brand/20 pb-kv-group">
        <div className="flex w-full flex-col items-stretch gap-kv-inline text-xs text-kv-text-secondary lg:flex-row lg:items-center">
          <div className="flex w-full shrink-0 items-center justify-between border-b border-kv-border pb-kv-pair font-medium select-none lg:w-auto lg:justify-start lg:border-b-0 lg:pb-0">
            <span>استاد راهنما:</span>
            <strong className="ms-kv-pair rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
              {supervisorName}
            </strong>
          </div>

          <div className="relative z-40 flex w-full flex-col items-start sm:flex-row sm:items-center lg:flex-1">
            <label
              htmlFor={schoolFieldId}
              className="mb-1 shrink-0 font-bold sm:mb-0 sm:me-kv-pair"
            >
              مدرسه همکار:
            </label>
            <KvSearchableCombobox
              id={schoolFieldId}
              className="w-full"
              value={assignment.schoolQuery}
              placeholder="جستجوی نام مدرسه..."
              disabled={realModeDisabled}
              open={schoolOpen}
              isLoading={assignment.isLoadingSchools}
              emptyLabel="مدرسه‌ای در حوزهٔ شما یافت نشد."
              items={assignment.schools.map((school) => ({
                id: school.id,
                label: school.name,
              }))}
              onOpenChange={(next) => {
                setSchoolOpen(next);
                if (next) {
                  setMentorOpen(false);
                  assignment.beginSchoolPick();
                }
              }}
              onDismiss={assignment.validateSchoolSelection}
              onChange={(query) => {
                setSchoolOpen(true);
                assignment.setSchoolSearch(query);
              }}
              onSelect={(item) => {
                const school = assignment.schools.find((row) => row.id === item.id);
                if (!school) return;
                assignment.selectSchool(school);
                setSchoolOpen(false);
                setMentorOpen(false);
              }}
            />
          </div>

          <div className="relative z-30 flex w-full flex-col items-start sm:flex-row sm:items-center lg:flex-1">
            <label
              htmlFor={mentorFieldId}
              className="mb-1 shrink-0 font-bold sm:mb-0 sm:me-kv-pair"
            >
              معلم ناظر:
            </label>
            <KvSearchableCombobox
              id={mentorFieldId}
              className="w-full"
              value={assignment.mentorQuery}
              placeholder="جستجوی نام مربی..."
              disabled={mentorLocked}
              open={mentorOpen && Boolean(assignment.selectedSchool)}
              isLoading={assignment.isLoadingMentors}
              emptyLabel="معلم ناظری برای این مدرسه یافت نشد."
              items={assignment.mentors.map((mentor) => ({
                id: mentor.id,
                label: mentor.name,
              }))}
              onOpenChange={(next) => {
                if (mentorLocked) return;
                setMentorOpen(next);
                if (next) setSchoolOpen(false);
              }}
              onDismiss={assignment.validateMentorSelection}
              onChange={(query) => {
                if (mentorLocked) return;
                setMentorOpen(true);
                assignment.setMentorSearch(query);
              }}
              onSelect={(item) => {
                const mentor = assignment.mentors.find((row) => row.id === item.id);
                if (!mentor) return;
                assignment.selectMentor(mentor);
                setMentorOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full justify-end">
        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          size="sm"
          fullWidth
          className="sm:w-auto"
          loading={assignment.isSubmitting}
          disabled={
            realModeDisabled ||
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
